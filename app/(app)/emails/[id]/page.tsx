"use client"

import { useEffect, useMemo, useState } from "react"
import mammoth from "mammoth"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Paperclip, Send } from "lucide-react"
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

export default function EmailDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const messageId = params.id

  const messageQuery = useMailMessageQuery(messageId)
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
  const [processedHtml, setProcessedHtml] = useState<string>("")

  const emailData = messageQuery.data
  const attachments: {
    id: string
    fileName: string
    contentType?: string
    fileSize?: number
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

  const attachmentExtractTextQuery = useAttachmentExtractTextQuery(
    messageId,
    attachmentViewMode === "extract" ? selectedAttachmentId : null
  )
  const attachmentContentQuery = useAttachmentContentQuery(
    messageId,
    attachmentViewMode === "content" ? selectedAttachmentId : null
  )

  const handleSendToAI = async () => {
    if (selectedForAI.size === 0) {
      alert("Vui lòng chọn ít nhất một file đính kèm để gửi AI bóc tách.")
      return
    }

    try {
      setExtractionPreview(null)
      // Fetch content for all selected attachments using authenticated axios
      const files = await Promise.all(
        Array.from(selectedForAI).map(async (attachmentId) => {
          const attachment = attachments.find((a) => a.id === attachmentId)
          if (!attachment) throw new Error(`Attachment ${attachmentId} not found`)

          // Get attachment content using authenticated axios instance
          const response = await MAIL_CONNECTOR_AXIOS.get(
            `/api/v1/mail-messages/${messageId}/attachments/${attachmentId}/content`
          )

          // Extract content from response - handle various response formats
          const responseData = response.data
          let content = ""
          if (typeof responseData === 'string') {
            content = responseData
          } else if (responseData?.data?.content) {
            content = responseData.data.content
          } else if (responseData?.content) {
            content = responseData.content
          } else if (responseData?.text) {
            content = responseData.text
          }

          // Extract text from DOCX if needed before sending to AI
          let aiContent = content
          const mimeType = attachment.contentType || "application/octet-stream"
          if (mimeType.includes("wordprocessingml") && content) {
            try {
              const byteCharacters = atob(content)
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

      // Send to document processor
      const result = await processDocumentsMutation.mutateAsync(files)

      // Get presigned URL for preview
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

      // Open modal with result
      setExtractionResult(result?.result || null)
      setExtractionResultOpen(true)
    } catch (error) {
      alert(getErrorMessage(error, "Gửi AI bóc tách thất bại."))
    }
  }

  const handleShowAttachmentExtractText = (attachmentId: string | undefined) => {
    if (!attachmentId) return
    setAttachmentViewMode("extract")
    setSelectedAttachmentId(attachmentId)
  }

  const handleShowAttachmentContent = (attachmentId: string | undefined, fileName?: string, contentType?: string) => {
    if (!attachmentId) return
    const url = `${API_BASE}/mail-messages/${messageId}/attachments/${attachmentId}/download`
    setFileViewerUrl(url)
    setFileViewerName(fileName || "")
    setFileViewerType(contentType || "")
    setFileViewerOpen(true)
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
      <div className="flex items-center gap-2">
        <Link href="/emails" className="flex cursor-pointer items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
      </div>

      <div className="flex gap-4">
        {/* Left — 70% Nội dung */}
        <div className="w-[70%] space-y-4 rounded-xl border border-neutral-100 bg-white p-6">
          <div id="tour-email-header" className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-neutral-300">{emailData?.subject || "(Không có tiêu đề)"}</h1>
              <p className="mt-1 text-sm text-neutral-200">
                Từ: {emailData?.fromName || "N/A"} ({emailData?.fromEmail || "N/A"})
              </p>
              <p className="text-sm text-neutral-200">
                Nhận lúc: {emailData?.receivedAt ? dayjs(emailData.receivedAt).format("DD/MM/YYYY HH:mm") : "—"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/emails/${messageId}/extract`}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50"
              >
                Trích xuất
              </Link>
              <button
                id="tour-email-ai-btn"
                onClick={handleSendToAI}
                disabled={processDocumentsMutation.isPending}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {processDocumentsMutation.isPending ? "Đang xử lý..." : `Gửi AI bóc tách${selectedForAI.size > 0 ? ` (${selectedForAI.size})` : ""}`}
              </button>
            </div>
          </div>

          <div id="tour-email-body" className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-200">Nội dung email</h3>
              {htmlContent && (
                <div className="flex items-center gap-1 rounded-md border border-neutral-100 bg-white p-1 text-xs">
                  <button
                    onClick={() => setContentMode("auto")}
                    className={`cursor-pointer rounded px-2 py-1 ${
                      contentMode === "auto" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setContentMode("text")}
                    className={`cursor-pointer rounded px-2 py-1 ${
                      contentMode === "text" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setContentMode("html")}
                    className={`cursor-pointer rounded px-2 py-1 ${
                      contentMode === "html" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    HTML
                  </button>
                </div>
              )}
            </div>

            {shouldShowHtml ? (
              <iframe
                title="email-html-content"
                srcDoc={processedHtml || htmlContent}
                sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                className="h-[720px] w-full rounded border border-neutral-100 bg-white"
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm text-neutral-300">
                {bodyText || "Không có nội dung text."}
              </div>
            )}
          </div>
        </div>

        {/* Right — 30% File đính kèm */}
        {attachments.length > 0 && (
          <div className="w-[30%] min-w-0 overflow-hidden rounded-xl border border-neutral-100 bg-white p-3">
            <div id="tour-email-attachments">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
                <Paperclip className="h-4 w-4" /> Tệp đính kèm ({attachments.length})
              </h3>
              <div className="grid gap-2 min-w-0">
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
                    onViewContent={() => handleShowAttachmentContent(attachment.id, attachment.fileName, attachment.contentType)}
                    onDownload={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                    status="completed"
                  />
                ))}
              </div>

              <AttachmentViewerModal
                open={!!selectedAttachmentId}
                onOpenChange={(open) => {
                  if (!open) setSelectedAttachmentId(null)
                }}
                title={attachmentViewMode === "extract" ? "Text trích xuất từ tệp" : "Nội dung tệp"}
                isLoading={attachmentExtractTextQuery.isPending || attachmentContentQuery.isPending}
                error={(attachmentExtractTextQuery.error || attachmentContentQuery.error) as Error | null}
                content={attachmentViewMode === "extract" ? (attachmentExtractTextQuery.data ?? null) : (attachmentContentQuery.data ?? null)}
              />

              <FileViewerModal
                open={fileViewerOpen}
                onOpenChange={setFileViewerOpen}
                fileUrl={fileViewerUrl}
                fileName={fileViewerName}
                fileType={fileViewerType}
              />

              <ExtractionResultModal
                open={extractionResultOpen}
                onOpenChange={setExtractionResultOpen}
                result={extractionResult}
                preview={extractionPreview}
                fileName={extractionFileName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
