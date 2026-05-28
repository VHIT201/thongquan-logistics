"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowLeft, Loader } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useAuthForgotPasswordSendOtpMutation,
  useAuthForgotPasswordConfirmResetMutation,
} from "@/hooks/use-auth-queries"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"send" | "confirm">("send")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const sendOtpMutation = useAuthForgotPasswordSendOtpMutation()
  const confirmResetMutation = useAuthForgotPasswordConfirmResetMutation()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await sendOtpMutation.mutateAsync({
        email,
        ipAddress: null,
        userAgent: null,
      })
      toast.success("Đã gửi OTP đến email của bạn.")
      setStep("confirm")
    } catch (err) {
      toast.error(getErrorMessage(err, "Gửi OTP thất bại."))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || !newPassword) return
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.")
      return
    }
    setLoading(true)
    try {
      await confirmResetMutation.mutateAsync({
        email,
        token: otp,
        newPassword,
      })
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.")
      router.push("/login")
    } catch (err) {
      toast.error(getErrorMessage(err, "Đặt lại mật khẩu thất bại."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-neutral-300">
            {step === "send" ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
          </h1>
          <p className="mt-1 text-sm text-neutral-200">
            {step === "send"
              ? "Nhập email để nhận mã OTP"
              : "Nhập mã OTP và mật khẩu mới"}
          </p>
        </div>

        {step === "send" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-200" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Gửi OTP"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex w-full items-center justify-center gap-1 text-sm text-neutral-200 hover:text-neutral-300 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại đăng nhập
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Mã OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full rounded-lg border border-neutral-100 px-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200 text-center tracking-[0.5em] font-mono"
                placeholder="123456"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-neutral-100 px-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-neutral-100 px-4 py-2.5 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Xác nhận"}
            </button>

            <button
              type="button"
              onClick={() => setStep("send")}
              className="flex w-full items-center justify-center gap-1 text-sm text-neutral-200 hover:text-neutral-300 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
