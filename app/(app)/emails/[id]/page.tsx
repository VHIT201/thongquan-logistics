"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import mammoth from "mammoth"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Bot, Paperclip, Send, User, X } from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
// API_BASE must match lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://vietprodev.duckdns.org/gateway/logistics/api/v1"
import { FileAttachmentItem } from "@/components/file-attachment-item"
import { AttachmentViewerModal } from "@/components/attachment-viewer-modal"
import { FileViewerModal } from "@/components/ui/file-viewer-modal"
import { ExtractionResultModal, type ExtractionPreviewSources } from "@/components/extraction-result-modal"
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
  const nested = top.data && typeof top.data === "object" ? (top.data as Record<string, unknown>) : null

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
  const nested = top.data && typeof top.data === "object" ? (top.data as Record<string, unknown>) : null

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
    Object.keys(expectedFields).length > 0
      ? JSON.stringify(expectedFields)
      : "{}"
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
  const router = useRouter()
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

  const [extractionResultOpen, setExtractionResultOpen] = useState(false)
  const [extractionResult, setExtractionResult] = useState<string | null>(null)
  const [extractionPreview, setExtractionPreview] = useState<ExtractionPreviewSources | null>(null)
  const [extractionFileName, setExtractionFileName] = useState<string | null>(null)
  const [aiMode, setAiMode] = useState<"chat" | "template">("chat")
  const [userPrompt, setUserPrompt] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [promptError, setPromptError] = useState<string | null>(null)
  const [processedHtml, setProcessedHtml] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const templates = useMemo(
    () =>
      ((templatesQuery.data ?? []) as TemplateItem[]).filter((template) =>
        template.isActive === undefined || template.isActive === null ? true : Boolean(template.isActive)
      ),
    [templatesQuery.data]
  )

  const emailData = messageQuery.data
  const attachments: {
    id: string
    fileName: string
    contentType?: string
    fileSize?: number
    previewUrl?: string
  }[] = emailData?.attachments ?? []
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

  // Process HTML to replace CID with base64 images
  useEffect(() => {
    const processInlineImages = async () => {
      if (!htmlContent || !/cid:/i.test(htmlContent)) {
        setProcessedHtml(htmlContent)
        return
      }

      let processed = htmlContent
      const cidRegex = /cid:([a-zA-Z0-9_-]+)/gi
      const cids = new Set<string>()
      let match

      while ((match = cidRegex.exec(htmlContent)) !== null) {
        cids.add(match[1])
      }

      // Try to find matching attachments by contentId or fileName
      for (const cid of cids) {
        const attachment = attachments.find(a =>
          (a as any).contentId === cid ||
          (a as any).contentId === `<${cid}>` ||
          a.fileName.includes(cid) ||
          // Match by image index: cid:ii_mpng8ohd0 -> image (1).png
          (a.fileName.startsWith("image") && cid.includes("ii_"))
        )

        if (attachment) {
          try {
            const response = await MAIL_CONNECTOR_AXIOS.get(
              `/api/v1/mail-messages/${messageId}/attachments/${attachment.id}/content`
            )

            const responseData = response.data
            let content = ""
            if (typeof responseData === 'string') {
              content = responseData
            } else if (responseData?.data?.content) {
              content = responseData.data.content
            } else if (responseData?.content) {
              content = responseData.content
            }

            if (content && attachment.contentType?.startsWith('image/')) {
              const dataUrl = `data:${attachment.contentType};base64,${content}`
              processed = processed.replace(new RegExp(`cid:${cid}`, 'gi'), dataUrl)
            }
          } catch (error) {
            console.error(`Failed to fetch content for CID ${cid}:`, error)
          }
        }
      }

      setProcessedHtml(processed)
    }

    processInlineImages()
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

    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null
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
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
              }
              const byteArray = new Uint8Array(byteNumbers)
              const arrayBuffer = byteArray.buffer
              const extractResult = await mammoth.extractRawText({ arrayBuffer })
              aiContent = extractResult.value
            } catch (e) {
              console.error("Error extracting text from DOCX:", e)
            }
          }

          return {
            fileName: attachment.fileName,
            content: aiContent,
            type: "text",
            mimeType: mimeType,
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
          const presignedResponse = await mailApi.getApiV1MailMessagesMessageIdAttachmentsAttachmentIdPresignedUrl(
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
              ? { ...msg, content: resultStr ? "Đã bóc tách xong theo template. Xem kết quả bên dưới." : "Không tìm thấy dữ liệu phù hợp.", result: resultStr, isLoading: false }
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

  const handleSendToAI = async () => {
    if (aiMode === "template") {
      const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null
      if (!selectedTemplate) {
        setPromptError("Vui lòng chọn template để bóc tách.")
        return
      }
      await sendChatMessage(`Bóc tách theo template: ${selectedTemplate.templateName || selectedTemplate.templateCode || "N/A"}`)
    } else {
      await sendChatMessage()
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

  const handleShowAttachmentContent = async (attachmentId: string | undefined, fileName?: string, contentType?: string, previewUrl?: string) => {
    if (!attachmentId) return
    
    // Check if this is an Office file (blob URL won't work with external viewers)
    const isOfficeFile = contentType?.toLowerCase().includes('word') || 
                         contentType?.toLowerCase().includes('excel') || 
                         contentType?.toLowerCase().includes('powerpoint') ||
                         contentType?.toLowerCase().includes('document') ||
                         contentType?.toLowerCase().includes('sheet') ||
                         contentType?.toLowerCase().includes('presentation')
    
    // For Office files, show download message (external viewers need public URLs)
    if (isOfficeFile) {
      setFileViewerUrl("")
      setFileViewerName(fileName || "")
      setFileViewerType(contentType || "")
      setFileViewerOpen(true)
      return
    }

    // For images/PDFs, download as blob and create object URL
    try {
      const downloadResponse = await MAIL_CONNECTOR_AXIOS.get(
        `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/download`,
        { responseType: 'blob' }
      )
      const blob = new Blob([downloadResponse.data], { type: contentType || 'application/octet-stream' })
      const objectUrl = URL.createObjectURL(blob)
      setFileViewerUrl(objectUrl)
      setFileViewerName(fileName || "")
      setFileViewerType(contentType || "")
      setFileViewerOpen(true)
    } catch (error) {
      alert(getErrorMessage(error, "Không thể xem trước tệp."))
    }
  }

  const handleDownloadAttachment = async (attachmentId: string | undefined, fileName?: string | null) => {
    if (!attachmentId) return
    try {
      await downloadAttachmentMutation.mutateAsync({ attachmentId, fileName })
    } catch (error) {
      alert(getErrorMessage(error, "Tải tệp thất bại."))
    }
  }

  if (messageQuery.isPending) {
    return <div className="text-sm text-neutral-200">Đang tải chi tiết email...</div>
  }

  if (messageQuery.error || !messageQuery.data) {
    return (
      <div className="space-y-3">
        <Link href="/emails" className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {getErrorMessage(messageQuery.error, "Không tải được chi tiết email.")}
        </div>
      </div>
    )
  }

  const shouldShowHtml = contentMode === "html" || (contentMode === "auto" && Boolean(htmlContent))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-neutral-200">
        <Link href="/emails" className="flex cursor-pointer items-center gap-1 hover:text-neutral-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
        </Link>
        <span className="text-neutral-300">|</span>
        <span className="truncate max-w-[200px] font-medium text-neutral-300">{emailData?.subject || "(Không tiêu đề)"}</span>
        <span className="hidden sm:inline text-neutral-300">—</span>
        <span className="hidden sm:inline">{emailData?.fromName || "N/A"}</span>
        <span className="ml-auto hidden sm:inline">{emailData?.receivedAt ? dayjs(emailData.receivedAt).format("DD/MM HH:mm") : "—"}</span>
        <Link href={`/emails/${messageId}/extract`} className="ml-2 rounded-md border border-neutral-100 px-2.5 py-1 text-[11px] font-medium hover:bg-neutral-50">Trích xuất</Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:h-[calc(100dvh-116px)]">
        {/* Col 1 — Files */}
        <div className="order-2 flex w-full flex-col gap-2 md:order-1 md:w-[220px] md:min-w-[220px]">
          <div className="rounded-xl border border-neutral-100 bg-white p-3 md:flex-1 md:overflow-y-auto">
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-neutral-200">
              <Paperclip className="h-3 w-3" /> Tệp ({attachments.length})
            </h3>
            {attachments.length === 0 ? (
              <p className="text-xs text-neutral-200">Không có tệp.</p>
            ) : (
              <div className="flex flex-col gap-2">
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
                    onViewContent={() => handleShowAttachmentContent(attachment.id, attachment.fileName, attachment.contentType, attachment.previewUrl)}
                    onDownload={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                    status="completed"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col 2 — Email */}
        <div className="order-1 flex w-full flex-col rounded-xl border border-neutral-100 bg-white p-4 md:order-2 md:flex-1 md:overflow-y-auto md:p-5">
          <div id="tour-email-body" className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-medium text-neutral-200">Nội dung</h3>
              {htmlContent && (
                <div className="flex items-center gap-1 rounded-md border border-neutral-100 bg-white p-1 text-[11px]">
                  <button onClick={() => setContentMode("auto")} className={`cursor-pointer rounded px-2 py-1 ${contentMode === "auto" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"}`}>Auto</button>
                  <button onClick={() => setContentMode("text")} className={`cursor-pointer rounded px-2 py-1 ${contentMode === "text" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"}`}>Text</button>
                  <button onClick={() => setContentMode("html")} className={`cursor-pointer rounded px-2 py-1 ${contentMode === "html" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"}`}>HTML</button>
                </div>
              )}
            </div>
            {shouldShowHtml ? (
              <iframe title="email-html-content" srcDoc={processedHtml || htmlContent} sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox" className="h-[400px] w-full rounded border border-neutral-100 bg-white md:h-full md:min-h-[400px]" />
            ) : (
              <div className="whitespace-pre-wrap text-sm text-neutral-300">{bodyText || "Không có nội dung text."}</div>
            )}
          </div>
        </div>

        {/* Col 3 — AI Chat */}
        <div className="order-3 flex w-full flex-col rounded-xl border border-neutral-200 bg-white shadow-sm md:w-[300px] md:min-w-[300px] md:overflow-hidden">
          <div className="flex items-center justify-between bg-primary px-3 py-2">
            <div className="flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-white" />
              <div>
                <p className="text-[11px] font-semibold text-white">AI Bóc tách</p>
                <p className="text-[10px] text-white/70">{selectedForAI.size > 0 ? `${selectedForAI.size} file` : "Chưa chọn file"}</p>
              </div>
            </div>
            <button onClick={() => setChatMessages([])} className="flex h-5 w-5 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 border-b border-neutral-100 px-3 py-1.5">
            <button type="button" onClick={() => { setAiMode("chat"); setPromptError(null) }} className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${aiMode === "chat" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>Chat</button>
            <button type="button" onClick={() => { setAiMode("template"); setPromptError(null) }} className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${aiMode === "template" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>Template</button>
            {aiMode === "template" && (
              <select value={selectedTemplateId} onChange={(event) => { setSelectedTemplateId(event.target.value); setPromptError(null) }} disabled={templatesQuery.isPending} className="ml-auto rounded-md border border-neutral-200 px-1.5 py-1 text-[11px] text-neutral-700 outline-none focus:border-primary">
                <option value="">-- Chọn --</option>
                {templates.map((template) => (
                  <option key={template.id || template.templateCode || "unknown"} value={template.id || ""}>
                    {[template.templateCode, template.templateName].filter(Boolean).join(" - ") || "Template"}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-neutral-50/50 px-3 py-2 space-y-2">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <Bot className="h-8 w-8 text-primary/40" />
                <div>
                  <p className="text-xs font-medium text-neutral-400">Chat với AI</p>
                  <p className="text-[11px] text-neutral-300 mt-0.5 max-w-[220px]">
                    {selectedForAI.size === 0 ? "Chọn file đính kèm trước." : `Đã chọn ${selectedForAI.size} file.`}
                  </p>
                </div>
              </div>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 mt-0.5">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div className={`max-w-[82%] space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-xl px-2.5 py-1.5 text-xs leading-relaxed ${msg.role === "user" ? "bg-primary text-white rounded-br-md" : "bg-white border border-neutral-100 text-neutral-700 rounded-bl-md"}`}>
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
                    <button onClick={() => openExtractionDetail(msg.result!)} className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10">
                      Xem chi tiết
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {promptError && <p className="px-3 py-1 text-[11px] text-red-500 bg-red-50 border-t border-red-100">{promptError}</p>}

          <div className="border-t border-neutral-100 bg-white px-3 py-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => { setChatInput(event.target.value); setPromptError(null) }}
                onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendChatMessage() } }}
                disabled={chatLoading}
                placeholder={aiMode === "chat" ? "Nhập yêu cầu..." : "Enter để bóc template"}
                className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 outline-none focus:border-primary focus:bg-white disabled:opacity-50"
              />
              <button onClick={() => sendChatMessage()} disabled={chatLoading || !chatInput.trim()} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AttachmentViewerModal
        open={!!selectedAttachmentId}
        onOpenChange={(open) => { if (!open) setSelectedAttachmentId(null) }}
        title={attachmentViewMode === "extract" ? "Text trích xuất từ tệp" : "Nội dung tệp"}
        isLoading={attachmentExtractTextQuery.isPending || attachmentContentQuery.isPending}
        error={(attachmentExtractTextQuery.error || attachmentContentQuery.error) as Error | null}
        content={attachmentViewMode === "extract" ? (attachmentExtractTextQuery.data ?? null) : (attachmentContentQuery.data ?? null)}
      />

      <FileViewerModal open={fileViewerOpen} onOpenChange={setFileViewerOpen} fileUrl={fileViewerUrl} fileName={fileViewerName} fileType={fileViewerType} />

      <ExtractionResultModal open={extractionResultOpen} onOpenChange={setExtractionResultOpen} result={extractionResult} preview={extractionPreview} fileName={extractionFileName} />
    </div>
  )
}


