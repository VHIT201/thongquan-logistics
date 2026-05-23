"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Paperclip, Send, AlertTriangle, CheckCircle } from "lucide-react"
import dayjs from "dayjs"

const emailData = {
  id: "1",
  subject: "Invoice #INV-001 - ABC Logistics",
  fromName: "ABC Logistics",
  fromEmail: "billing@abclogistics.com",
  receivedAt: "2026-05-22T09:30:00Z",
  bodyText: `Dear Team,

Please find attached the invoice for shipment #SH-2026-001.

Invoice Number: INV-001
Amount: 12,500,000 VND
Due Date: 2026-06-15

Best regards,
ABC Logistics Billing`,
  attachments: [
    { id: "a1", fileName: "invoice_001.pdf", contentType: "application/pdf", fileSize: 245760 },
    { id: "a2", fileName: "manifest_001.xlsx", contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileSize: 51200 },
  ],
}

export default function EmailDetailPage() {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)

  const handleSendToAI = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      router.push(`/emails/${emailData.id}/extract`)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/emails" className="flex items-center gap-1 text-sm text-neutral-200 hover:text-neutral-300">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-6 space-y-4">
        <div id="tour-email-header" className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-300">{emailData.subject}</h1>
            <p className="text-sm text-neutral-200 mt-1">
              Từ: {emailData.fromName} ({emailData.fromEmail})
            </p>
            <p className="text-sm text-neutral-200">
              Nhận lúc: {dayjs(emailData.receivedAt).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-50">
              Trích xuất
            </button>
            <button
              id="tour-email-ai-btn"
              onClick={handleSendToAI}
              disabled={processing}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {processing ? "Đang xử lý..." : "Gửi AI bóc tách"}
            </button>
          </div>
        </div>

        <div id="tour-email-body" className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
          <h3 className="text-sm font-medium text-neutral-200 mb-2">Nội dung email</h3>
          <div className="text-sm text-neutral-300 whitespace-pre-wrap">
            {emailData.bodyText}
          </div>
        </div>

        {emailData.attachments.length > 0 && (
          <div id="tour-email-attachments">
            <h3 className="text-sm font-medium text-neutral-200 mb-2 flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Tệp đính kèm ({emailData.attachments.length})
            </h3>
            <div className="grid gap-2">
              {emailData.attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 hover:bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-4 w-4 text-neutral-200" />
                    <div>
                      <p className="text-sm font-medium text-neutral-300">{att.fileName}</p>
                      <p className="text-xs text-neutral-200">{att.contentType} · {(att.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-[#346538]">
                    <CheckCircle className="h-3 w-3" /> Hợp lệ
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
