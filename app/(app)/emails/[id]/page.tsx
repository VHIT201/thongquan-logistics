"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Bot, Paperclip, Send, User, X, Play, Sparkles, Tag, FileSearch } from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/get-error-message"
import { usePermission } from "@/hooks/use-permission"
import { useAuthStore, getTenantIdFromToken } from "@/lib/stores/auth-store"
import {
  useMailAssignmentStatusQuery,
  useAssignMailMutation,
  useReassignMailMutation,
  useConfirmMailAssignmentMutation,
  useCompleteMailAssignmentMutation,
  useUpdateMailAssignmentStatusMutation,
} from "@/hooks/use-mail-assignments-queries"
import { useUsersQuery } from "@/hooks/use-user-queries"
import { MAIL_CONNECTOR_AXIOS } from "@/lib/orval/mail-connector-mutator"
import { FileAttachmentItem } from "@/components/file-attachment-item"
import { AttachmentViewerModal } from "@/components/attachment-viewer-modal"
import { FileViewerModal } from "@/components/ui/file-viewer-modal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  ExtractionResultModal,
  type ExtractionPreviewSources,
} from "@/components/extraction-result-modal"
import {
  TemplateResultModal,
  type ExtractionPreviewSources as TemplatePreviewSources,
} from "@/components/template-result-modal"
import {
  useAttachmentContentQuery,
  useAttachmentExtractTextQuery,
  useDownloadAttachmentMutation,
  useEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useMailMessageQuery,
  useTriggerPipelineMutation,
  useNormalizeMailMutation,
  useClassifyMailMutation,
  useExtractMailMutation,
} from "@/hooks/use-mail-queries"
import { getLogisticsPlatformAPI } from "@/lib/generated/mail-connector/endpoints"
import {
  useGetAiChatConversationByEntityQuery,
  useCreateAiChatConversationMutation,
  useLinkAiChatEntityMutation,
  useGetAiChatMessagesQuery,
  useLinkAiChatAttachmentMutation,
  useSendAiChatMessageMutation,
  type AiChatMessage,
} from "@/hooks/use-ai-chat-queries"

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
  displayContent?: string
  result?: string | null
  isLoading?: boolean
  inputTokens?: number | null
  outputTokens?: number | null
  totalTokens?: number | null
  finishReason?: string | null
}

export default function EmailDetailPage() {
  const params = useParams<{ id: string }>()
  const messageId = params.id

  const messageQuery = useMailMessageQuery(messageId)
  const templatesQuery = useEmailTemplatesQuery()
  const downloadAttachmentMutation = useDownloadAttachmentMutation(messageId)
  const triggerPipelineMutation = useTriggerPipelineMutation()
  const normalizeMailMutation = useNormalizeMailMutation()
  const classifyMailMutation = useClassifyMailMutation()
  const extractMailMutation = useExtractMailMutation()

  // AI Chat hooks
  const conversationByEntityQuery = useGetAiChatConversationByEntityQuery(
    messageId ? { entityType: "mail_message", entityId: messageId } : null
  )
  const createConversationMutation = useCreateAiChatConversationMutation()
  const linkEntityMutation = useLinkAiChatEntityMutation()
  const linkAttachmentMutation = useLinkAiChatAttachmentMutation()
  const sendMessageMutation = useSendAiChatMessageMutation()
  const messagesQuery = useGetAiChatMessagesQuery(
    conversationByEntityQuery.data?.id ?? null
  )

  const { has: canProcessMailPermission } = usePermission("mail.process")
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.isAdmin)()

  const assignmentStatusQuery = useMailAssignmentStatusQuery(messageId)
  const assignMutation = useAssignMailMutation()
  const reassignMutation = useReassignMailMutation()
  const confirmMutation = useConfirmMailAssignmentMutation()
  const completeMutation = useCompleteMailAssignmentMutation()
  const updateStatusMutation = useUpdateMailAssignmentStatusMutation()

  const assignmentData = assignmentStatusQuery.data as Record<string, unknown> | undefined
  const assignedToUserId = assignmentData?.assignedToUserId as string | undefined
  const assignmentStatus = assignmentData?.status as string | undefined
  const isAssignedToMe = assignedToUserId === currentUser?.userId
  const canProcessMail = canProcessMailPermission && (isAdmin || isAssignedToMe)

  const [reassignModalOpen, setReassignModalOpen] = useState(false)
  const [selectedReassignUserId, setSelectedReassignUserId] = useState("")

  const usersQuery = useUsersQuery({ page: 1, pageSize: 100 })
  const userList = (() => {
    const raw = usersQuery.data
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === "object" && "data" in raw) {
      const d = raw as unknown as Record<string, unknown>
      if (Array.isArray(d.data)) return d.data
    }
    return []
  })()

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
  const [templateResultOpen, setTemplateResultOpen] = useState(false)
  const [templateExtractedData, setTemplateExtractedData] = useState<Record<string, string>>({})

  const [aiMode, setAiMode] = useState<"chat" | "template">("chat")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [promptError, setPromptError] = useState<string | null>(null)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [newTemplateCode, setNewTemplateCode] = useState("")
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateFields, setNewTemplateFields] = useState("{}")
  const createTemplateMutation = useCreateEmailTemplateMutation()

  const [processedHtml, setProcessedHtml] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatLoading = sendMessageMutation.isPending || linkAttachmentMutation.isPending

  const tenantId = useMemo(() => getTenantIdFromToken(), [])

  const templates = useMemo(
    () =>
      ((templatesQuery.data ?? []) as TemplateItem[]).filter((template) =>
        template.isActive === undefined || template.isActive === null
          ? true
          : Boolean(template.isActive)
      ),
    [templatesQuery.data]
  )

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
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

  // Conversation initialization: find existing or create new
  const [conversationId, setConversationId] = useState<string | null>(null)
  const hasAttemptedCreate = useRef(false)

  useEffect(() => {
    if (conversationByEntityQuery.data?.id) {
      setConversationId(conversationByEntityQuery.data.id)
      return
    }
    if (conversationByEntityQuery.isLoading) return

    if (!hasAttemptedCreate.current && messageId && currentUser?.userId) {
      hasAttemptedCreate.current = true
      createConversationMutation.mutate(
        {
          title: emailData?.subject || `Email ${messageId}`,
          createdBy: currentUser.userId,
          idempotencyKey: `email:${messageId}`,
          ...(tenantId ? { tenantId } : {}),
        },
        {
          onSuccess: (newConv) => {
            const newId = newConv.id
            setConversationId(newId)
            linkEntityMutation.mutate({
              conversationId: newId,
              payload: { entityType: "mail_message", entityId: messageId },
            })
          },
        }
      )
    }
  }, [
    conversationByEntityQuery.data,
    conversationByEntityQuery.isLoading,
    messageId,
    currentUser?.userId,
    emailData?.subject,
    createConversationMutation,
    linkEntityMutation,
  ])

  function extractJsonFromRaw(raw: string): Record<string, unknown> | null {
    // 1. Try pure JSON first
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed
    } catch {}

    // 2. Try code block ```json ... ```
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1])
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed
      } catch {}
    }

    // 3. Find largest JSON object in text
    let best: Record<string, unknown> | null = null
    let bestLen = 0
    const objectRegex = /\{[\s\S]*?\}/g
    let m: RegExpExecArray | null
    while ((m = objectRegex.exec(raw)) !== null) {
      try {
        const parsed = JSON.parse(m[0])
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && m[0].length > bestLen) {
          best = parsed
          bestLen = m[0].length
        }
      } catch {}
    }
    return best
  }

  function formatFieldsDisplay(parsed: Record<string, unknown>): { display: string; result: string } {
    const fieldsObj = parsed.fields as Record<string, unknown> | undefined
    const missing = (parsed.missingFields ?? []) as string[]
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : null
    const entries = fieldsObj ? Object.entries(fieldsObj) : []
    const filled = entries.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    const total = entries.length

    const lines: string[] = []
    lines.push(`✅ Đã trích xuất ${filled.length}/${total} trường`)
    lines.push("")

    if (filled.length > 0) {
      lines.push("📝 Có dữ liệu:")
      for (const [key, value] of filled) {
        lines.push(`  • ${key}: ${String(value)}`)
      }
      lines.push("")
    }

    if (missing.length > 0) {
      lines.push(`⚠️ Thiếu ${missing.length} trường:`)
      lines.push(`  ${missing.join(", ")}`)
      lines.push("")
    }

    if (confidence !== null) {
      const pct = Math.round(confidence * 100)
      lines.push(`📊 Độ tin cậy: ${pct}%`)
    }

    return { display: lines.join("\n"), result: JSON.stringify(parsed) }
  }

  function parseAiDisplayContent(raw: string): { display: string; result: string | null } {
    const jsonObj = extractJsonFromRaw(raw)
    if (jsonObj) {
      if (jsonObj.fields && typeof jsonObj.fields === "object" && !Array.isArray(jsonObj.fields)) {
        return formatFieldsDisplay(jsonObj)
      }
      if (jsonObj.fields && Array.isArray(jsonObj.fields)) {
        const lines = (jsonObj.fields as Array<{ name?: string; value?: string }>)
          .map((f) => `${f.name ?? ""}: ${f.value ?? ""}`)
        const summary = typeof jsonObj.summary === "string" ? jsonObj.summary : ""
        return {
          display: [...lines, summary].filter(Boolean).join("\n"),
          result: JSON.stringify(jsonObj),
        }
      }
      if (typeof jsonObj.summary === "string") {
        return { display: jsonObj.summary, result: JSON.stringify(jsonObj) }
      }
      return { display: JSON.stringify(jsonObj, null, 2), result: JSON.stringify(jsonObj) }
    }

    return { display: raw, result: null }
  }

  // Sync BE messages to local chat state
  useEffect(() => {
    if (!messagesQuery.data) return
    const mapped: ChatMessage[] = messagesQuery.data.map((msg: AiChatMessage) => {
      let displayContent = msg.content
      let result: string | null = null
      if (msg.role === "assistant") {
        const parsed = parseAiDisplayContent(msg.content)
        displayContent = parsed.display
        if (aiMode === "template") {
          result = parsed.result
        }
      }
      return {
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        displayContent,
        result,
        isLoading: false,
        inputTokens: msg.inputTokens,
        outputTokens: msg.outputTokens,
        totalTokens: msg.totalTokens,
        finishReason: msg.finishReason,
      }
    })
    setChatMessages(mapped)
  }, [messagesQuery.data, aiMode])

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
    if (!text && aiMode !== "template") return

    if (selectedForAI.size === 0) {
      setPromptError("Vui lòng chọn ít nhất một file đính kèm trước khi chat.")
      return
    }

    if (aiMode === "template" && !selectedTemplate) {
      setPromptError("Vui lòng chọn template để bóc tách.")
      return
    }

    if (!conversationId) {
      setPromptError("Chưa có conversation. Vui lòng thử lại.")
      return
    }

    setPromptError(null)
    setChatInput("")

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    }
    setChatMessages((prev) => [...prev, userMsg])

    try {
      setExtractionPreview(null)

      // Link attachments to conversation
      const linkedAttachments = await Promise.all(
        Array.from(selectedForAI).map(async (attachmentId) => {
          const attachment = attachments.find((a) => a.id === attachmentId)
          if (!attachment) throw new Error(`Attachment ${attachmentId} not found`)

          const linked = await linkAttachmentMutation.mutateAsync({
            conversationId,
            payload: {
              source: "mailconnector",
              messageId,
              attachmentId,
              fileName: attachment.fileName,
              contentType: attachment.contentType,
              fileSize: attachment.fileSize,
              ...(tenantId ? { tenantId } : {}),
              createdBy: currentUser?.userId || "",
            },
          })
          return linked.id
        })
      )

      // Send message — assistant response will sync via messagesQuery refetch
      await sendMessageMutation.mutateAsync({
        conversationId,
        payload: {
          message: text,
          selectedAttachmentIds: linkedAttachments.filter(Boolean),
          provider: "openai",
          model: "deepseek/deepseek-v4-flash-20260423",
          responseFormat: aiMode === "template" ? "json" : "text",
          templateId: aiMode === "template" ? (selectedTemplateId || null) : null,
          ...(tenantId ? { tenantId } : {}),
          createdBy: currentUser?.userId || "",
        },
      })

      // For template mode, set preview from first selected attachment
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
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: getErrorMessage(error, "Gửi AI thất bại."),
        },
      ])
    }
  }

  const openExtractionDetail = async (result: string) => {
    if (aiMode === "template") {
      try {
        const parsed = JSON.parse(result) as Record<string, unknown>
        const fieldsObj = parsed.fields as Record<string, unknown> | undefined
        const flat: Record<string, string> = {}
        if (fieldsObj && typeof fieldsObj === "object" && !Array.isArray(fieldsObj)) {
          for (const [key, value] of Object.entries(fieldsObj)) {
            flat[key] = value === null || value === undefined ? "" : String(value)
          }
        }
        setTemplateExtractedData(flat)

        // Fetch fresh presigned URL for the first selected attachment
        const firstAttachmentId = Array.from(selectedForAI)[0]
        const firstAttachment = attachments.find((a) => a.id === firstAttachmentId)
        if (firstAttachmentId && firstAttachment) {
          try {
            const response = await MAIL_CONNECTOR_AXIOS.get(
              `/api/v1/mail-messages/${messageId}/attachments/${firstAttachmentId}/presigned-url`
            )
            const data =
              response.data && typeof response.data === "object"
                ? (response.data as Record<string, unknown>)
                : null
            const nestedData =
              data?.data && typeof data.data === "object"
                ? (data.data as Record<string, unknown>)
                : null
            const rawUrl =
              typeof (nestedData ?? data)?.url === "string"
                ? ((nestedData ?? data)?.url as string)
                : null

            if (rawUrl) {
              const ct = (firstAttachment.contentType ?? "").toLowerCase()
              const isOfficeFile =
                ct.includes("word") || ct.includes("excel") || ct.includes("powerpoint") ||
                ct.includes("document") || ct.includes("sheet") || ct.includes("presentation")
              const safeUrl = `/api/attachment-proxy?url=${encodeURIComponent(rawUrl)}`
              setExtractionPreview({
                url: isOfficeFile ? null : safeUrl,
                expiresAt: null,
                googleViewerUrl: isOfficeFile
                  ? `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`
                  : null,
                officeViewerUrl: null,
                proxyUrl: null,
              })
              setExtractionFileName(firstAttachment.fileName)
            }
          } catch {
            // Preview không load được, modal vẫn mở — auto-fetch sẽ xử lý
          }
        }

        setTemplateResultOpen(true)
      } catch {
        setExtractionResult(result)
        setExtractionResultOpen(true)
      }
    } else {
      setExtractionResult(result)
      setExtractionResultOpen(true)
    }
  }

  const handleTemplateDataChange = (data: Record<string, string>) => {
    setTemplateExtractedData(data)
  }

  const handleExported = () => {
    if (!messageId) return
    updateStatusMutation.mutate({
      messageId,
      payload: { status: "Exported", notes: "Exported via AI extraction result" },
    })
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

      if (!presignedUrl) {
        alert("Không thể tạo link xem trước.")
        return
      }

      const isOfficeFile =
        contentType?.toLowerCase().includes("word") ||
        contentType?.toLowerCase().includes("excel") ||
        contentType?.toLowerCase().includes("powerpoint") ||
        contentType?.toLowerCase().includes("document") ||
        contentType?.toLowerCase().includes("sheet") ||
        contentType?.toLowerCase().includes("presentation")

      const safeUrl = `/api/attachment-proxy?url=${encodeURIComponent(presignedUrl)}`
      if (isOfficeFile) {
        setFileViewerUrl(`https://docs.google.com/viewer?url=${encodeURIComponent(presignedUrl)}&embedded=true`)
      } else {
        setFileViewerUrl(safeUrl)
      }
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
              {assignmentStatusQuery.isPending && (
                <span className="text-neutral-300">...</span>
              )}
              {assignedToUserId && !assignmentStatusQuery.isPending && (
                <>
                  <span className="hidden sm:inline">|</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                    Đang xử lý
                  </span>
                </>
              )}
              {!assignedToUserId && !assignmentStatusQuery.isPending && (
                <>
                  <span className="hidden sm:inline">|</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                    Chưa phân công
                  </span>
                </>
              )}
              {isAssignedToMe && assignmentStatus === "assigned" && (
                <button
                  onClick={() => confirmMutation.mutate({ messageId, payload: {} })}
                  disabled={confirmMutation.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {confirmMutation.isPending ? "..." : "Xác nhận"}
                </button>
              )}
              {isAssignedToMe && assignmentStatus === "confirmed" && (
                <button
                  onClick={() => completeMutation.mutate({ messageId, payload: {} })}
                  disabled={completeMutation.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {completeMutation.isPending ? "..." : "Hoàn thành"}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    setSelectedReassignUserId(assignedToUserId ?? "")
                    setReassignModalOpen(true)
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 hover:bg-amber-100"
                >
                  Giao việc
                </button>
              )}
              {!isAssignedToMe && !assignedToUserId && !isAdmin && (
                <button
                  onClick={() => assignMutation.mutate({ messageId })}
                  disabled={assignMutation.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assignMutation.isPending ? "..." : "Nhận xử lý"}
                </button>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {canProcessMail && (
              <>
                <button
                  onClick={() => triggerPipelineMutation.mutate(messageId)}
                  disabled={triggerPipelineMutation.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  {triggerPipelineMutation.isPending ? "..." : "Pipeline"}
                </button>
                <button
                  onClick={() => normalizeMailMutation.mutate(messageId)}
                  disabled={normalizeMailMutation.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  {normalizeMailMutation.isPending ? "..." : "Normalize"}
                </button>
                <button
                  onClick={() => classifyMailMutation.mutate(messageId)}
                  disabled={classifyMailMutation.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Tag className="h-3 w-3" />
                  {classifyMailMutation.isPending ? "..." : "Classify"}
                </button>
                <button
                  onClick={() => extractMailMutation.mutate(messageId)}
                  disabled={extractMailMutation.isPending}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileSearch className="h-3 w-3" />
                  {extractMailMutation.isPending ? "..." : "Extract"}
                </button>
              </>
            )}
          </div>
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
                    className={`cursor-pointer rounded px-2.5 py-1 font-medium transition ${
                      contentMode === "auto" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setContentMode("text")}
                    className={`cursor-pointer rounded px-2.5 py-1 font-medium transition ${
                      contentMode === "text" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setContentMode("html")}
                    className={`cursor-pointer rounded px-2.5 py-1 font-medium transition ${
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
                className="cursor-pointer rounded p-1 text-white/80 hover:bg-white/10 hover:text-white"
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
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium ${
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
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium ${
                  aiMode === "template" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"
                }`}
                >
                  Template
                </button>

              {aiMode === "template" && (
                <div className="ml-auto flex min-w-0 items-center gap-2">
                  <select
                    value={selectedTemplateId}
                    onChange={(event) => {
                      setSelectedTemplateId(event.target.value)
                      setPromptError(null)
                    }}
                    disabled={templatesQuery.isPending}
                    className="max-w-[180px] rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-700 outline-none focus:border-primary"
                    title={templates.find((t) => t.id === selectedTemplateId)?.templateName ?? ""}
                  >
                    <option value="">-- Chọn template --</option>
                    {templates.map((template) => (
                      <option key={template.id || template.templateCode || "unknown"} value={template.id || ""}>
                        {[template.templateCode, template.templateName].filter(Boolean).join(" - ") || "Template"}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCreateTemplate((s) => !s)}
                    className="cursor-pointer shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100"
                    title="Tạo template mới"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {aiMode === "template" && showCreateTemplate && (
              <div className="border-t border-neutral-100 bg-neutral-50/50 px-3 py-2 space-y-1.5">
                <p className="text-[11px] font-medium text-neutral-500">Tạo template mới</p>
                <input
                  type="text"
                  placeholder="Mã template"
                  value={newTemplateCode}
                  onChange={(e) => setNewTemplateCode(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-800 outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Tên template"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 px-2 py-1 text-[11px] text-neutral-800 outline-none focus:border-primary"
                />
                <textarea
                  placeholder='Expected fields JSON, ví dụ {"invoiceNumber":"Mã hóa đơn"}'
                  value={newTemplateFields}
                  onChange={(e) => setNewTemplateFields(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-neutral-200 px-2 py-1 font-mono text-[10px] text-neutral-800 outline-none focus:border-primary"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTemplate(false)
                      setNewTemplateCode("")
                      setNewTemplateName("")
                      setNewTemplateFields("{}")
                    }}
                    className="cursor-pointer rounded-md px-2 py-1 text-[11px] text-neutral-500 hover:bg-neutral-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={createTemplateMutation.isPending || !newTemplateCode.trim() || !newTemplateName.trim()}
                    onClick={async () => {
                      try {
                        let expectedFields: Record<string, string> = {}
                        try {
                          expectedFields = JSON.parse(newTemplateFields || "{}")
                          if (typeof expectedFields !== "object" || Array.isArray(expectedFields)) {
                            throw new Error("Expected fields phải là object JSON.")
                          }
                        } catch {
                          setPromptError("Expected fields JSON không hợp lệ.")
                          return
                        }
                        const result = await createTemplateMutation.mutateAsync({
                          templateCode: newTemplateCode.trim(),
                          templateName: newTemplateName.trim(),
                          expectedFields,
                        })
                        const createdId = (result as { id?: string | null })?.id || null
                        if (createdId) {
                          setSelectedTemplateId(createdId)
                        }
                        setShowCreateTemplate(false)
                        setNewTemplateCode("")
                        setNewTemplateName("")
                        setNewTemplateFields("{}")
                        setPromptError(null)
                        toast.success("Đã tạo template mới.")
                      } catch (err) {
                        setPromptError(getErrorMessage(err, "Tạo template thất bại."))
                      }
                    }}
                    className="cursor-pointer rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-white hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {createTemplateMutation.isPending ? "Đang tạo..." : "Tạo"}
                  </button>
                </div>
              </div>
            )}
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
                      <pre className="whitespace-pre-wrap font-sans">{msg.displayContent ?? msg.content}</pre>
                    )}

                    {msg.result && (() => {
                      try {
                        const parsed = JSON.parse(msg.result) as Record<string, unknown>
                        const fields = parsed.fields as Record<string, unknown> | undefined
                        if (fields && typeof fields === "object" && !Array.isArray(fields)) {
                          const filled = Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
                          if (filled.length > 0) {
                            return (
                              <div className="mt-1.5 rounded-lg border border-neutral-100 bg-neutral-50/70 p-2 space-y-1">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">Dữ liệu trích xuất</p>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                  {filled.map(([key, value]) => (
                                    <div key={key} className="flex flex-col min-w-0">
                                      <span className="text-[10px] text-neutral-400 truncate">{key}</span>
                                      <span className="text-[11px] font-medium text-neutral-700 truncate">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                        }
                      } catch {}
                      return null
                    })()}
                  </div>

                  {msg.role === "assistant" && (msg.totalTokens || msg.inputTokens || msg.outputTokens) && (
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>🪙 {msg.totalTokens ?? 0} tokens</span>
                      {msg.inputTokens !== null && msg.inputTokens !== undefined && (
                        <span>in: {msg.inputTokens}</span>
                      )}
                      {msg.outputTokens !== null && msg.outputTokens !== undefined && (
                        <span>out: {msg.outputTokens}</span>
                      )}
                      {msg.finishReason && (
                        <span>· {msg.finishReason}</span>
                      )}
                    </div>
                  )}

                  {msg.result && aiMode === "template" && (
                    <button
                      onClick={() => void openExtractionDetail(String(msg.result))}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
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

            {chatLoading && (
              <div className="flex justify-start gap-1.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
                <div className="max-w-[82%]">
                  <div className="rounded-xl rounded-bl-md border border-neutral-100 bg-white px-2.5 py-1.5 text-xs leading-relaxed text-neutral-700">
                    <div className="flex items-center gap-1 py-0.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

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

      <TemplateResultModal
        open={templateResultOpen}
        onOpenChange={setTemplateResultOpen}
        fields={selectedTemplate?.expectedFields ?? {}}
        data={templateExtractedData}
        onDataChange={handleTemplateDataChange}
        preview={extractionPreview as TemplatePreviewSources | null}
        fileName={extractionFileName}
        templates={templates}
        onExport={handleExported}
        attachments={attachments}
        messageId={messageId}
      />

      {/* Admin Reassign Dialog */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-black">Giao việc xử lý mail</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-neutral-300">
              Chọn người dùng để giao việc xử lý email này.
            </p>
            <div className="max-h-[300px] space-y-1 overflow-y-auto">
              {usersQuery.isPending && (
                <p className="text-sm text-neutral-200">Đang tải danh sách...</p>
              )}
              {userList.map((item: unknown) => {
                const u = item as Record<string, unknown>
                const uid = String(u.id ?? "")
                return (
                  <button
                    key={uid}
                    onClick={() => setSelectedReassignUserId(uid)}
                    className={`flex cursor-pointer w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      selectedReassignUserId === uid
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-neutral-100 text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      selectedReassignUserId === uid
                        ? "border-primary bg-primary"
                        : "border-neutral-300"
                    }`}>
                      {selectedReassignUserId === uid && (
                        <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{String(u.fullName ?? u.email ?? "—")}</p>
                      <p className="text-xs text-neutral-200">{String(u.email ?? "")}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReassignModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => {
                  if (!selectedReassignUserId) return
                  reassignMutation.mutate(
                    {
                      messageId,
                      payload: { toUserId: selectedReassignUserId },
                    },
                    {
                      onSuccess: () => {
                        toast.success("Đã giao việc thành công.")
                        setReassignModalOpen(false)
                      },
                    }
                  )
                }}
                disabled={!selectedReassignUserId || reassignMutation.isPending}
              >
                {reassignMutation.isPending ? "..." : "Xác nhận giao"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
