"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Shield, Clock, BarChart3, User, Lock } from "lucide-react"
import Image from "next/image"
import { getErrorMessage } from "@/lib/get-error-message"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useAuthLoginMutation } from "@/hooks/use-auth-queries"

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useAuthLoginMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await loginMutation.mutateAsync({ email, password })
      // API response wrapper: { data: { accessToken, user }, meta, errors }
      const apiData = res?.data ?? res
      const accessToken = apiData?.accessToken
      const refreshToken = apiData?.refreshToken
      const user = apiData?.user
      if (accessToken && user && typeof window !== "undefined") {
        localStorage.setItem("token", accessToken)
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
        if (user?.userId) localStorage.setItem("userId", user.userId)

        setAuth({
          user,
          accessToken,
          refreshToken: refreshToken ?? "",
        })

        // Redirect based on role
        if (user.roles?.includes("admin")) {
          router.push("/")
        } else {
          router.push("/user")
        }
      } else {
        throw new Error("Đăng nhập thất bại, thiếu thông tin.")
      }
    } catch (err) {
      setError(getErrorMessage(err, "Đăng nhập thất bại."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-end">
      {/* Full screen background image */}
      <Image
        src="/loginthongquan.png"
        alt="Logistics background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-linear-to-r from-[#1e3a5f]/70 via-[#1e3a5f]/40 to-transparent" />

      {/* Left content overlay */}
      <div className="absolute left-0 top-0 hidden h-full w-1/2 flex-col justify-between p-12 text-white lg:flex">
        {/* <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight">LOGISTICS</span>
              <span className="block text-xs font-medium tracking-widest text-primary-50">MAIL</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Kết nối vận chuyển<br />– Giao nhận toàn cầu
          </h2>
          <p className="mt-4 max-w-md text-base text-primary-50">
            Giải pháp quản lý logistics hiệu quả, an toàn và nhanh chóng.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Bảo mật tuyệt đối</p>
              <p className="text-xs text-primary-50">Thông tin được mã hóa và bảo vệ an toàn</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Hiệu quả vượt trội</p>
              <p className="text-xs text-primary-50">Quy trình tối ưu, tiết kiệm thời gian</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary-100" />
            <div>
              <p className="text-sm font-semibold">Quản lý toàn diện</p>
              <p className="text-xs text-primary-50">Kiểm soát mọi đơn hàng mọi lúc, mọi nơi</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Right side - Login form */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div id="tour-login-form" className="w-full max-w-[420px] rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-300">Logistics Mail</h1>
            <p className="mt-1 text-sm text-neutral-200">Đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-200" />
                <input
                  id="tour-login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                  placeholder="admin@company.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-200" />
                <input
                  id="tour-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-100 py-2.5 pl-10 pr-4 text-sm text-neutral-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white transition-colors placeholder:text-neutral-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-100 text-primary focus:ring-primary"
                />
                Ghi nhớ đăng nhập
              </label>
              <a href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-500 cursor-pointer">
                Quên mật khẩu?
              </a>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              id="tour-login-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-neutral-200">hoặc</span>
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-100 bg-white px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-50"
            >
              <Image
                src="/logo-meu-solutions.png"
                alt="MEU Solutions"
                width={50}
                height={50}
                // style={{}}
                // className="h-5 w-5 object-contain"
              />
              Đăng nhập SSO Meucorp
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-neutral-200">
            © 2026 THONG QUAN JOINT STOCK COMPANY.
          </p>
          <p className="text-center text-xs text-neutral-200">
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
