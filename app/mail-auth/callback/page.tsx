"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Mail, XCircle } from "lucide-react"
import { getMailConnectorAPI } from "@/lib/generated/mail-connector/endpoints"
import { getErrorMessage } from "@/lib/get-error-message"

const mailApi = getMailConnectorAPI()

function MailAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const authorizationCode = useMemo(
    () => searchParams.get("code") ?? searchParams.get("authorizationCode"),
    [searchParams]
  )
  const state = useMemo(() => searchParams.get("state"), [searchParams])

  useEffect(() => {
    const run = async () => {
      try {
        if (!authorizationCode) {
          throw new Error("Thiếu authorization code từ Gmail.")
        }

        const storedState = sessionStorage.getItem("mail_oauth_state")
        if (storedState && state && storedState !== state) {
          throw new Error("OAuth state không hợp lệ. Vui lòng thử lại.")
        }

        const redirectUri = `${window.location.origin}/mail-auth/callback`
        await mailApi.postApiV1MailAccountsConnect({
          authorizationCode,
          redirectUri,
        })
        sessionStorage.removeItem("mail_oauth_state")
        router.replace("/admin/settings?connected=1")
      } catch (callbackError) {
        setError(getErrorMessage(callbackError, "Xử lý callback Gmail thất bại."))
      }
    }

    void run()
  }, [authorizationCode, router, state])

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-neutral-300">Xác thực Gmail</h1>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => router.replace("/admin/settings")}
              className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Quay về cấu hình
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang hoàn tất kết nối tài khoản...
          </div>
        )}
      </div>
    </div>
  )
}

export default function MailAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}>
      <MailAuthCallbackContent />
    </Suspense>
  )
}
