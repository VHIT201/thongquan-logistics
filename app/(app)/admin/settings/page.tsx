"use client"

import { useState } from "react"
import { Mail, Cpu, RefreshCw, CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const [gmailConnected, setGmailConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("Extract invoice details: invoice number, amount, currency, due date, sender")
  const [saved, setSaved] = useState(false)

  const handleConnectGmail = () => {
    // OAuth flow would go here
    setGmailConnected(true)
  }

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 2000)
  }

  const handleSavePrompt = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Cấu hình Hệ thống</h1>

      {/* Gmail Settings */}
      <div id="tour-settings-gmail" className="rounded-xl border border-blue-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">Tài khoản Gmail</h2>
        </div>

        {gmailConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" /> Đã kết nối: logistics@company.com
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectGmail}
            className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <Mail className="h-4 w-4" /> Kết nối tài khoản Gmail
          </button>
        )}
      </div>

      {/* AI / Rule Engine */}
      <div id="tour-settings-ai" className="rounded-xl border border-blue-200 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-blue-900">AI / Rule Engine</h2>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-700">Prompt bóc tách mặc định</label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-blue-50/50 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-700">Pattern lọc tiêu đề (Regex)</label>
          <input
            type="text"
            defaultValue="(invoice|shipping|logistics|freight|cargo)"
            className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-blue-50/50 focus:bg-white transition-colors"
          />
          <p className="mt-1 text-xs text-blue-500">Chỉ xử lý email có tiêu đề khớp với pattern này</p>
        </div>

        <button
          onClick={handleSavePrompt}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {saved ? <CheckCircle className="h-4 w-4" /> : "Lưu cấu hình"}
          {saved && " Đã lưu"}
        </button>
      </div>
    </div>
  )
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
