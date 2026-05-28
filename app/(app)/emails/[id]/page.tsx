"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import mammoth from "mammoth"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Bot, Paperclip, Send, User, X } from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
import { FileAttachmentItem } from "@/components/file-attachment-item"
import { AttachmentViewerModal } from "@/components/attachment-viewer-modal"
import { FileViewerModal } from "@/components/ui/file-viewer-modal"
import {
  ExtractionResultModal,
  type ExtractionPreviewSources,
} from "@/components/extraction-result-modal"
import {
  useAttachmentContentQuery,
  useAttachmentExtractTextQuery,
  useDownloadAttachmentMutation,
  useEmailTemplatesQuery,
  useMailMessageQuery,
  useProcessDocumentsMutation,
} from "@/hooks/use-mail-queries"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"

const mailApi = getLogisticsPlatformAPI()
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://vietprodev.duckdns.org/gateway/logistics/api/v1"

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function resolvePresignedPreview(response: unknown): ExtractionPreviewSources | null {
  const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === "object" ? (value as Record<string, unknown>) : null

  const root = asRecord(response)
  const level1 = asRecord(root?.data)
  const level2 = asRecord(level1?.data)
  const candidates = [root, level1, level2].filter(Boolean) as Record<string, unknown>[]

  for (const candidate of candidates) {
    const url = readString(candidate.url)
    const googleViewerUrl = readString(candidate.googleViewerUrl)
    const officeViewerUrl = readString(candidate.officeViewerUrl)
    const proxyUrl = readString(candidate.proxyUrl)
    const expiresAt = readString(candidate.expiresAt)

    if (url || googleViewerUrl || officeViewerUrl || proxyUrl) {
      return { url, googleViewerUrl, officeViewerUrl, proxyUrl, expiresAt }
    }
  }

  return null
}

function extractTextFromApiResponse(payload: unknown): string {
  if (typeof payload === "string") return payload
  if (!payload || typeof payload !== "object") return ""

  const top = payload as Record<string, unknown>
  const nested =
    top.data && typeof top.data === "object" ? (top.data as Record<string, unknown>) : null

  const candidates: unknown[] = [
    top.text,
    top.content,
    top.body,
    top.extractedText,
    top.result,
    top.value,
    nested?.text,
    nested?.content,
    nested?.body,
    nested?.extractedText,
    nested?.result,
    nested?.value,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate
  }
  return ""
}

function extractResultStringFromProcessResponse(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return typeof payload === "string" ? payload : null
  }

  const top = payload as Record<string, unknown>
  const nested =
    top.data && typeof top.data === "object" ? (top.data as Record<string, unknown>) : null
  const candidates: unknown[] = [top.result, nested?.result, top.data]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate
  }

  return null
}

type TemplateItem = {
  id?: string | null
  templateCode?: string | null
  templateName?: string | null
  description?: string | null
  expectedFields?: Record<string, string> | null
  isActive?: boolean | null
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  result?: string | null
  isLoading?: boolean
}

function buildChatPrompt(userPrompt: string) {
  return [
    "Bạn là hệ thống hỗ trợ bóc tách chứng từ logistics.",
    "Trả lời trực tiếp bằng văn bản tự nhiên, không bắt buộc JSON.",
    "Có thể liệt kê thông tin, giải thích hoặc trích xuất theo yêu cầu người dùng.",
    `Yêu cầu: ${userPrompt}`,
  ].join(" ")
}

function buildTemplatePrompt(template: TemplateItem) {
  const templateName = [template.templateCode, template.templateName].filter(Boolean).join(" - ")
  const expectedFields = template.expectedFields ?? {}
  const fieldsDescription =
    Object.keys(expectedFields).length > 0 ? JSON.stringify(expectedFields) : "{}"

  return [
    "Bạn là hệ thống bóc tách chứng từ logistics.",
    "Trả về DUY NHẤT JSON hợp lệ, không markdown, không giải thích.",
    "Định dạng bắt buộc: một mảng object (array of objects).",
    "Nếu chỉ có 1 bản ghi thì vẫn trả về mảng gồm 1 object.",
    "Bóc tách theo template đã chọn, giữ nguyên key field theo expectedFields.",
    "Nếu thiếu dữ liệu cho trường nào thì để chuỗi rỗng.",
    "Không trả về base64, không hướng dẫn decode, không thêm ghi chú ngoài JSON.",
    `Template đang áp dụng: ${templateName || "N/A"}.`,
    `Mô tả template: ${template.description || "N/A"}.`,
    `Expected fields JSON: ${fieldsDescription}.`,
  ].join(" ")
}

export default function EmailDetailPage() {
  const params = useParams<{ id: string }>()
  const messageId = params.id

  const messageQuery = useMailMessageQuery(messageId)
  const templatesQuery = useEmailTemplatesQuery()
  const processDocumentsMutation = useProcessDocumentsMutation()
  const downloadAttachmentMutation = useDownloadAttachmentMutation(messageId)

  const [contentMode, setContentMode] = useState<"auto" | "text" | "html">("auto")
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null)
  const [attachmentViewMode, setAttachmentViewMode] = useState<"extract" | "content">("extract")
  const [selectedForAI, setSelectedForAI] = useState<Set<string>>(new Set())

  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [fileViewerUrl, setFileViewerUrl] = useState("")
  const [fileViewerName, setFileViewerName] = useState("")
  const [fileViewerType, setFileViewerType] = useState("")
  const [fileViewerAttachmentId, setFileViewerAttachmentId] = useState<string | undefined>(undefined)

  const [extractionResultOpen, setExtractionResultOpen] = useState(false)
  const [extractionResult, setExtractionResult] = useState<string | null>(null)
  const [extractionPreview, setExtractionPreview] = useState<ExtractionPreviewSources | null>(null)
  const [extractionFileName, setExtractionFileName] = useState<string | null>(null)

  const [aiMode, setAiMode] = useState<"chat" | "template">("chat")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [promptError, setPromptError] = useState<string | null>(null)

  const [processedHtml, setProcessedHtml] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const templates = useMemo(
    () =>
      ((templatesQuery.data ?? []) as TemplateItem[]).filter((template) =>
        template.isActive === undefined || template.isActive === null
          ? true
          : Boolean(template.isActive)
      ),
    [templatesQuery.data]
  )

  const emailData = messageQuery.data
  const attachments = useMemo(
    () =>
      (emailData?.attachments ?? []) as Array<{
        id: string
        fileName: string
        contentType?: string
        fileSize?: number
        previewUrl?: string
        contentId?: string
      }>,
    [emailData?.attachments]
  )

  const bodyText = emailData?.bodyText || ""
  const bodyHtml = emailData?.bodyHtml || ""

  const htmlContent = useMemo(() => {
    if (bodyHtml.trim()) return bodyHtml
    const trimmed = bodyText.trim()
    const looksLikeHtml =
      /^<!doctype html/i.test(trimmed) ||
      /^<html/i.test(trimmed) ||
      /<body[\s>]/i.test(trimmed) ||
      /<table[\s>]/i.test(trimmed) ||
      /<head[\s>]/i.test(trimmed)
    return looksLikeHtml ? trimmed : ""
  }, [bodyHtml, bodyText])

  useEffect(() => {
    const processInlineImages = async () => {
      if (!htmlContent || !/cid:/i.test(htmlContent)) {
        setProcessedHtml(htmlContent)
        return
      }

      let processed = htmlContent
      const cidRegex = /cid:([a-zA-Z0-9_-]+)/gi
      const cids = new Set<string>()
      let match: RegExpExecArray | null

      while ((match = cidRegex.exec(htmlContent)) !== null) {
        cids.add(match[1])
      }

      for (const cid of cids) {
        const attachment = attachments.find(
          (a) =>
            a.contentId === cid ||
            a.contentId === `<${cid}>` ||
            a.fileName.includes(cid) ||
            (a.fileName.startsWith("image") && cid.includes("ii_"))
        )

        if (!attachment) continue

        try {
          const response = await MAIL_CONNECTOR_AXIOS.get(
            `/api/v1/mail-messages/${messageId}/attachments/${attachment.id}/content`
          )

          const responseData = response.data
          let content = ""
          if (typeof responseData === "string") {
            content = responseData
          } else if (responseData?.data?.content) {
            content = responseData.data.content
          } else if (responseData?.content) {
            content = responseData.content
          }

          if (content && attachment.contentType?.startsWith("image/")) {
            const dataUrl = `data:${attachment.contentType};base64,${content}`
            processed = processed.replace(new RegExp(`cid:${cid}`, "gi"), dataUrl)
          }
        } catch (error) {
          console.error(`Failed to fetch content for CID ${cid}:`, error)
        }
      }

      setProcessedHtml(processed)
    }

    void processInlineImages()
  }, [htmlContent, attachments, messageId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const attachmentExtractTextQuery = useAttachmentExtractTextQuery(
    messageId,
    attachmentViewMode === "extract" ? selectedAttachmentId : null
  )

  const attachmentContentQuery = useAttachmentContentQuery(
    messageId,
    attachmentViewMode === "content" ? selectedAttachmentId : null
  )

  const sendChatMessage = async (messageText?: string) => {
    const text = (messageText ?? chatInput).trim()
    if (!text) return

    if (selectedForAI.size === 0) {
      setPromptError("Vui lòng chọn ít nhất một file đính kèm trước khi chat.")
      return
    }

    const selectedTemplate =
      templates.find((template) => template.id === selectedTemplateId) ?? null
    if (aiMode === "template" && !selectedTemplate) {
      setPromptError("Vui lòng chọn template để bóc tách.")
      return
    }

    setPromptError(null)
    setChatInput("")

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    }
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      isLoading: true,
    }

    setChatMessages((prev) => [...prev, userMsg, aiMsg])
    setChatLoading(true)

    try {
      setExtractionPreview(null)

      const files = await Promise.all(
        Array.from(selectedForAI).map(async (attachmentId) => {
          const attachment = attachments.find((a) => a.id === attachmentId)
          if (!attachment) throw new Error(`Attachment ${attachmentId} not found`)

          const mimeType = attachment.contentType || "application/octet-stream"
          let aiContent = ""

          if (mimeType.includes("pdf")) {
            const extractTextResponse = await MAIL_CONNECTOR_AXIOS.get(
              `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/extract-text`
            )
            aiContent = extractTextFromApiResponse(extractTextResponse.data)
          } else {
            const contentResponse = await MAIL_CONNECTOR_AXIOS.get(
              `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/content`
            )
            aiContent = extractTextFromApiResponse(contentResponse.data)
          }

          if (mimeType.includes("wordprocessingml") && aiContent) {
            try {
              const byteCharacters = atob(aiContent)
              const byteNumbers = new Array(byteCharacters.length)
              for (let i = 0; i < byteCharacters.length; i += 1) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
              }
              const byteArray = new Uint8Array(byteNumbers)
              const arrayBuffer = byteArray.buffer
              const extractResult = await mammoth.extractRawText({ arrayBuffer })
              aiContent = extractResult.value
            } catch (error) {
              console.error("Error extracting text from DOCX:", error)
            }
          }

          return {
            fileName: attachment.fileName,
            content: aiContent,
            type: "text",
            mimeType,
          }
        })
      )

      const extractionPrompt =
        aiMode === "template" && selectedTemplate
          ? buildTemplatePrompt(selectedTemplate)
          : buildChatPrompt(text)

      const result = await processDocumentsMutation.mutateAsync({
        files,
        prompt: extractionPrompt,
        model: "gpt-4",
      })

      const resultStr = extractResultStringFromProcessResponse(result)

      if (aiMode === "template") {
        const firstAttachmentId = Array.from(selectedForAI)[0]
        const firstAttachment = attachments.find((a) => a.id === firstAttachmentId)

        if (firstAttachment) {
          const presignedResponse =
            await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl(
              messageId,
              firstAttachmentId,
              { expiryMinutes: 30 }
            )
          setExtractionPreview(resolvePresignedPreview(presignedResponse))
          setExtractionFileName(firstAttachment.fileName)
        }

        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsg.id
              ? {
                  ...msg,
                  content: resultStr
                    ? "Đã bóc tách xong theo template. Bạn có thể mở chi tiết bên dưới."
                    : "Không tìm thấy dữ liệu phù hợp.",
                  result: resultStr,
                  isLoading: false,
                }
              : msg
          )
        )
      } else {
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsg.id
              ? { ...msg, content: resultStr || "Không có phản hồi.", isLoading: false }
              : msg
          )
        )
      }
    } catch (error) {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsg.id
            ? { ...msg, content: getErrorMessage(error, "Gửi AI bóc tách thất bại."), isLoading: false }
            : msg
        )
      )
    } finally {
      setChatLoading(false)
    }
  }

  const openExtractionDetail = (result: string) => {
    setExtractionResult(result)
    setExtractionResultOpen(true)
  }

  const handleShowAttachmentExtractText = (attachmentId: string | undefined) => {
    if (!attachmentId) return
    setAttachmentViewMode("extract")
    setSelectedAttachmentId(attachmentId)
  }

  const handleShowAttachmentContent = async (
    attachmentId: string | undefined,
    fileName?: string,
    contentType?: string
  ) => {
    if (!attachmentId) return

    const isOfficeFile =
      contentType?.toLowerCase().includes("word") ||
      contentType?.toLowerCase().includes("excel") ||
      contentType?.toLowerCase().includes("powerpoint") ||
      contentType?.toLowerCase().includes("document") ||
      contentType?.toLowerCase().includes("sheet") ||
      contentType?.toLowerCase().includes("presentation")

    if (isOfficeFile) {
      try {
        const response = await MAIL_CONNECTOR_AXIOS.get(
          `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/presigned-url`
        )
        const data =
          response.data && typeof response.data === "object"
            ? (response.data as Record<string, unknown>)
            : null
        const nestedData =
          data?.data && typeof data.data === "object"
            ? (data.data as Record<string, unknown>)
            : null
        const nestedUrl = nestedData?.url
        const rootUrl = data?.url
        const presignedUrl =
          typeof nestedUrl === "string"
            ? nestedUrl
            : typeof rootUrl === "string"
              ? rootUrl
              : null
        if (presignedUrl) {
          const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(presignedUrl)}&embedded=true`
          setFileViewerUrl(googleDocsUrl)
          setFileViewerName(fileName || "")
          setFileViewerType(contentType || "")
          setFileViewerAttachmentId(attachmentId)
          setFileViewerOpen(true)
          return
        }
      } catch {
        console.log("Presigned URL failed for Office file, showing download message")
      }

      setFileViewerUrl("")
      setFileViewerName(fileName || "")
      setFileViewerType(contentType || "")
      setFileViewerAttachmentId(attachmentId)
      setFileViewerOpen(true)
      return
    }

    try {
      const downloadResponse = await MAIL_CONNECTOR_AXIOS.get(
        `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/download`,
        { responseType: "blob" }
      )
      const blob = new Blob([downloadResponse.data], {
        type: contentType || "application/octet-stream",
      })
      const objectUrl = URL.createObjectURL(blob)
      setFileViewerUrl(objectUrl)
      setFileViewerName(fileName || "")
      setFileViewerType(contentType || "")
      setFileViewerAttachmentId(attachmentId)
      setFileViewerOpen(true)
    } catch (error) {
      alert(getErrorMessage(error, "Không thể xem trước tệp."))
    }
  }

  const handleDownloadAttachment = async (
    attachmentId: string | undefined,
    fileName?: string | null
  ) => {
    if (!attachmentId) return
    try {
      await downloadAttachmentMutation.mutateAsync({ attachmentId, fileName })
    } catch (error) {
      alert(getErrorMessage(error, "Tải tệp thất bại."))
    }
  }

  if (messageQuery.isPending) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 text-sm text-neutral-400">
        Đang tải chi tiết email...
      </div>
    )
  }

  if (messageQuery.error || !messageQuery.data) {
    return (
      <div className="space-y-4">
        <Link
          href="/emails"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {getErrorMessage(messageQuery.error, "Không tải được chi tiết email.")}
        </div>
      </div>
    )
  }

  const shouldShowHtml = contentMode === "html" || (contentMode === "auto" && Boolean(htmlContent))

  return (
    <div className="flex h-[calc(100dvh-120px)] min-h-0 flex-col gap-4 overflow-hidden">
      <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <div className="space-y-1.5">
            <Link
              href="/emails"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 hover:text-neutral-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại danh sách
            </Link>
            <h1 className="max-w-4xl text-lg font-semibold text-neutral-900 md:text-xl">
              {emailData?.subject || "(Không tiêu đề)"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
              <span>{emailData?.fromName || emailData?.fromEmail || "N/A"}</span>
              <span className="hidden sm:inline">|</span>
              <span>
                {emailData?.receivedAt
                  ? dayjs(emailData.receivedAt).format("DD/MM/YYYY HH:mm")
                  : "--"}
              </span>
            </div>
          </div>

          <Link
            href={`/emails/${messageId}/extract`}
            className="ml-auto inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            Trích xuất
          </Link>
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-3 gap-4 overflow-hidden xl:grid-cols-[260px_minmax(0,1fr)_360px] xl:grid-rows-1">
        <aside className="flex min-h-0 flex-col rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Paperclip className="h-3.5 w-3.5" />
              Tệp đính kèm
            </h2>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {attachments.length}
            </span>
          </div>

          {attachments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
              Không có tệp đính kèm.
            </p>
          ) : (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {attachments.map((attachment) => (
                <FileAttachmentItem
                  key={attachment.id}
                  id={attachment.id}
                  fileName={attachment.fileName}
                  fileType={attachment.contentType?.split("/").pop() || "unknown"}
                  fileSize={attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : "N/A"}
                  isChecked={selectedForAI.has(attachment.id)}
                  onCheckChange={(checked) => {
                    const next = new Set(selectedForAI)
                    if (checked) next.add(attachment.id)
                    else next.delete(attachment.id)
                    setSelectedForAI(next)
                  }}
                  onViewExtract={() => handleShowAttachmentExtractText(attachment.id)}
                  onViewContent={() =>
                    handleShowAttachmentContent(
                      attachment.id,
                      attachment.fileName,
                      attachment.contentType
                    )
                  }
                  onDownload={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                  status="completed"
                />
              ))}
            </div>
          )}
        </aside>

        <section className="flex min-h-0 flex-col rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div id="tour-email-body" className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-neutral-800">Nội dung email</h2>
              {htmlContent && (
                <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50 p-1 text-[11px]">
                  <button
                    onClick={() => setContentMode("auto")}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      contentMode === "auto" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setContentMode("text")}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      contentMode === "text" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setContentMode("html")}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      contentMode === "html" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    HTML
                  </button>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1">
              {shouldShowHtml ? (
                <iframe
                  title="email-html-content"
                  srcDoc={processedHtml || htmlContent}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                  className="h-full w-full rounded-xl border border-neutral-200 bg-white"
                />
              ) : (
                <div className="h-full overflow-y-auto whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  {bodyText || "Không có nội dung text."}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="bg-primary px-3 py-2.5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-white/15 p-1">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide">Trợ lý AI</p>
                  <p className="text-[11px] text-white/80">
                    {selectedForAI.size > 0
                      ? `${selectedForAI.size} file được chọn`
                      : "Chưa chọn file"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatMessages([])}
                className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
                title="Xóa hội thoại"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="border-b border-neutral-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAiMode("chat")
                  setPromptError(null)
                }}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                  aiMode === "chat" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiMode("template")
                  setPromptError(null)
                }}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                  aiMode === "template" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`}
                >
                  Template
                </button>

              {aiMode === "template" && (
                <select
                  value={selectedTemplateId}
                  onChange={(event) => {
                    setSelectedTemplateId(event.target.value)
                    setPromptError(null)
                  }}
                  disabled={templatesQuery.isPending}
                  className="ml-auto rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-700 outline-none focus:border-primary"
                >
                  <option value="">-- Chọn template --</option>
                  {templates.map((template) => (
                    <option key={template.id || template.templateCode || "unknown"} value={template.id || ""}>
                      {[template.templateCode, template.templateName].filter(Boolean).join(" - ") || "Template"}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-50/70 px-3 py-3 space-y-2">
            {chatMessages.length === 0 && (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-center">
                <Bot className="h-8 w-8 text-primary/40" />
                <p className="text-xs font-medium text-neutral-500">Chưa có hội thoại</p>
                <p className="max-w-[230px] text-[11px] text-neutral-400">
                  {selectedForAI.size === 0
                    ? "Hãy chọn ít nhất một file ở cột bên trái trước khi chat."
                    : `Đã chọn ${selectedForAI.size} file. Bạn có thể bắt đầu.`}
                </p>
              </div>
            )}

            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md border border-neutral-100 bg-white text-neutral-700"
                    }`}
                  >
                    {msg.isLoading ? (
                      <div className="flex items-center gap-1 py-0.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "300ms" }} />
                      </div>
                    ) : (
                      <>{msg.content}</>
                    )}
                  </div>

                  {msg.result && (
                    <button
                      onClick={() => openExtractionDetail(String(msg.result))}
                      className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          {promptError && (
            <p className="border-t border-red-100 bg-red-50 px-3 py-1 text-[11px] text-red-600">{promptError}</p>
          )}

          <div className="border-t border-neutral-100 bg-white px-3 py-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => {
                  setChatInput(event.target.value)
                  setPromptError(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void sendChatMessage()
                  }
                }}
                disabled={chatLoading}
                placeholder={aiMode === "chat" ? "Nhập yêu cầu..." : "Enter để bóc template"}
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 outline-none focus:border-primary focus:bg-white disabled:opacity-50"
              />
              <button
                onClick={() => {
                  void sendChatMessage()
                }}
                disabled={chatLoading || !chatInput.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <AttachmentViewerModal
        open={!!selectedAttachmentId}
        onOpenChange={(open) => {
          if (!open) setSelectedAttachmentId(null)
        }}
        title={attachmentViewMode === "extract" ? "Text trích xuất từ tệp" : "Nội dung tệp"}
        isLoading={attachmentExtractTextQuery.isPending || attachmentContentQuery.isPending}
        error={(attachmentExtractTextQuery.error || attachmentContentQuery.error) as Error | null}
        content={
          attachmentViewMode === "extract"
            ? (attachmentExtractTextQuery.data ?? null)
            : (attachmentContentQuery.data ?? null)
        }
      />

      <FileViewerModal
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        fileUrl={fileViewerUrl}
        fileName={fileViewerName}
        fileType={fileViewerType}
        downloadUrl={
          fileViewerAttachmentId
            ? `${API_BASE}/mail-messages/${messageId}/attachments/${fileViewerAttachmentId}/download`
            : undefined
        }
      />

      <ExtractionResultModal
        open={extractionResultOpen}
        onOpenChange={setExtractionResultOpen}
        result={extractionResult}
        preview={extractionPreview}
        fileName={extractionFileName}
      />
    </div>
  )
}
