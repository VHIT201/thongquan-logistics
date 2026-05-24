"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Download, FileText, Paperclip, Send } from "lucide-react"
import dayjs from "dayjs"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAttachmentContentQuery,
  useAttachmentExtractTextQuery,
  useDownloadAttachmentMutation,
  useMailMessageQuery,
  useProcessMailMutation,
} from "@/hooks/use-mail-queries"

export default function EmailDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const messageId = params.id

  const messageQuery = useMailMessageQuery(messageId)
  const processMutation = useProcessMailMutation()
  const downloadAttachmentMutation = useDownloadAttachmentMutation(messageId)

  const [contentMode, setContentMode] = useState<"auto" | "text" | "html">("auto")
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null)
  const [attachmentViewMode, setAttachmentViewMode] = useState<"extract" | "content">("extract")

  const emailData = messageQuery.data
  const attachments = emailData?.attachments ?? []
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

  const attachmentExtractTextQuery = useAttachmentExtractTextQuery(
    messageId,
    attachmentViewMode === "extract" ? selectedAttachmentId : null
  )
  const attachmentContentQuery = useAttachmentContentQuery(
    messageId,
    attachmentViewMode === "content" ? selectedAttachmentId : null
  )

  const handleSendToAI = async () => {
    try {
      const analysisResult = await processMutation.mutateAsync(messageId)
      const analysisId = analysisResult?.id ? `?analysisId=${analysisResult.id}` : ""
      router.push(`/emails/${messageId}/extract${analysisId}`)
    } catch (error) {
      alert(getErrorMessage(error, "Gửi AI bóc tách thất bại."))
    }
  }

  const handleShowAttachmentExtractText = (attachmentId: string | undefined) => {
    if (!attachmentId) return
    setAttachmentViewMode("extract")
    setSelectedAttachmentId(attachmentId)
  }

  const handleShowAttachmentContent = (attachmentId: string | undefined) => {
    if (!attachmentId) return
    setAttachmentViewMode("content")
    setSelectedAttachmentId(attachmentId)
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
        <Link href="/emails" className="flex items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
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
        <Link href="/emails" className="flex items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-100 bg-white p-6">
        <div id="tour-email-header" className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-neutral-300">{emailData.subject || "(Không có tiêu đề)"}</h1>
            <p className="mt-1 text-sm text-neutral-200">
              Từ: {emailData.fromName || "N/A"} ({emailData.fromEmail || "N/A"})
            </p>
            <p className="text-sm text-neutral-200">
              Nhận lúc: {emailData.receivedAt ? dayjs(emailData.receivedAt).format("DD/MM/YYYY HH:mm") : "—"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/emails/${messageId}/extract`}
              className="flex items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50"
            >
              Trích xuất
            </Link>
            <button
              id="tour-email-ai-btn"
              onClick={handleSendToAI}
              disabled={processMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {processMutation.isPending ? "Đang xử lý..." : "Gửi AI bóc tách"}
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
                  className={`rounded px-2 py-1 ${
                    contentMode === "auto" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  Auto
                </button>
                <button
                  onClick={() => setContentMode("text")}
                  className={`rounded px-2 py-1 ${
                    contentMode === "text" ? "bg-primary text-white" : "text-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setContentMode("html")}
                  className={`rounded px-2 py-1 ${
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
              srcDoc={htmlContent}
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              className="h-[720px] w-full rounded border border-neutral-100 bg-white"
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm text-neutral-300">
              {bodyText || "Không có nội dung text."}
            </div>
          )}
        </div>

        {attachments.length > 0 && (
          <div id="tour-email-attachments">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-200">
              <Paperclip className="h-4 w-4" /> Tệp đính kèm ({attachments.length})
            </h3>
            <div className="grid gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-4 w-4 text-neutral-200" />
                    <div>
                      <p className="text-sm font-medium text-neutral-300">{attachment.fileName}</p>
                      <p className="text-xs text-neutral-200">
                        {attachment.contentType || "unknown"} ·{" "}
                        {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleShowAttachmentExtractText(attachment.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                    >
                      <FileText className="h-3 w-3" /> Trích text
                    </button>
                    <button
                      onClick={() => handleShowAttachmentContent(attachment.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50"
                    >
                      <FileText className="h-3 w-3" /> Nội dung
                    </button>
                    <button
                      onClick={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                      disabled={downloadAttachmentMutation.isPending}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-100 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <Download className="h-3 w-3" /> Tải
                    </button>
                    <span className="flex items-center gap-1 text-xs text-[#346538]">
                      <CheckCircle className="h-3 w-3" /> Hợp lệ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {selectedAttachmentId && (
              <div className="mt-3 space-y-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-300">
                    {attachmentViewMode === "extract" ? "Text trích xuất từ tệp" : "Nội dung tệp"}
                  </p>
                  <button
                    onClick={() => setSelectedAttachmentId(null)}
                    className="text-xs text-neutral-200 hover:text-neutral-300"
                  >
                    Đóng
                  </button>
                </div>
                {(attachmentExtractTextQuery.isPending || attachmentContentQuery.isPending) && (
                  <p className="text-xs text-neutral-200">Đang tải nội dung tệp...</p>
                )}
                {(attachmentExtractTextQuery.error || attachmentContentQuery.error) && (
                  <p className="text-xs text-red-600">
                    {getErrorMessage(
                      attachmentExtractTextQuery.error || attachmentContentQuery.error,
                      "Không tải được nội dung tệp."
                    )}
                  </p>
                )}
                {attachmentViewMode === "extract" && Boolean(attachmentExtractTextQuery.data) && (
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-white p-3 text-xs text-neutral-300">
                    {attachmentExtractTextQuery.data}
                  </pre>
                )}
                {attachmentViewMode === "content" && Boolean(attachmentContentQuery.data) && (
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-white p-3 text-xs text-neutral-300">
                    {attachmentContentQuery.data}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
