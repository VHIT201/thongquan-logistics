"use client"
// USER ROUTE: Hồ sơ cá nhân — user quản lý thông tin và đổi mật khẩu

import { useState } from "react"
import {
  Loader2,
  Pencil,
  Save,
  KeyRound,
  Mail,
  User,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  AlertCircle,
  ChevronRight,
  Lock,
  UserCircle,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useCurrentUserQuery,
  useUpdateMyProfileMutation,
  useChangeMyPasswordMutation,
} from "@/hooks/use-user-queries"

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 animate-pulse rounded-full bg-neutral-100" />
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function UserDashboardPage() {
  const currentUserQuery = useCurrentUserQuery()
  const updateProfileMutation = useUpdateMyProfileMutation()
  const changePasswordMutation = useChangeMyPasswordMutation()

  const user = currentUserQuery.data

  const [editingProfile, setEditingProfile] = useState(false)
  const [editFullName, setEditFullName] = useState("")

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  const startEditProfile = () => {
    setEditFullName(user?.fullName ?? "")
    setEditingProfile(true)
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({ fullName: editFullName })
      toast.success("Cập nhật hồ sơ thành công.")
      setEditingProfile(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật hồ sơ thất bại."))
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword })
      toast.success("Đổi mật khẩu thành công.")
      setShowChangePassword(false)
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      toast.error(getErrorMessage(err, "Đổi mật khẩu thất bại."))
    }
  }

  const isMutating = updateProfileMutation.isPending || changePasswordMutation.isPending

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Tài khoản của tôi</h1>
        <p className="mt-1 text-sm text-neutral-500">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {currentUserQuery.isPending && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <ProfileSkeleton />
        </div>
      )}

      {!currentUserQuery.isPending && !user && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="mt-4 text-base font-medium text-neutral-900">Không tải được thông tin</p>
          <p className="mt-1 text-sm text-neutral-500">Vui lòng thử tải lại trang</p>
        </div>
      )}

      {user && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {/* Card Header with Avatar */}
            <div className="bg-linear-to-r from-neutral-50 to-white px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-primary text-2xl font-bold text-white">
                      {getInitials(user.fullName || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">{user.fullName || "Chưa cập nhật"}</h2>
                    <p className="mt-0.5 text-sm text-neutral-500">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        >
                          {role}
                        </Badge>
                      ))}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        Hoạt động
                      </span>
                    </div>
                  </div>
                </div>
                {!editingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEditProfile}
                    className="gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Card Content */}
            <div className="px-8 py-6">
              <AnimatePresence mode="wait">
                {editingProfile ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-neutral-50 text-neutral-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium text-neutral-700">
                        Họ và tên
                      </Label>
                      <Input
                        id="fullName"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        autoFocus
                        className="text-neutral-900"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProfile(false)}
                      >
                        <X className="mr-1.5 h-4 w-4" /> Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isMutating}
                      >
                        {isMutating ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-1.5 h-4 w-4" />
                        )}
                        Lưu thay đổi
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0"
                  >
                    {[
                      {
                        icon: <Mail className="h-5 w-5 text-neutral-400" />,
                        label: "Email",
                        value: user.email,
                      },
                      {
                        icon: <UserCircle className="h-5 w-5 text-neutral-400" />,
                        label: "Họ và tên",
                        value: user.fullName || <span className="italic text-neutral-400">Chưa cập nhật</span>,
                      },
                      {
                        icon: <ShieldCheck className="h-5 w-5 text-neutral-400" />,
                        label: "Vai trò",
                        value: (
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className="border-neutral-200 bg-neutral-50 text-neutral-700"
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        ),
                      },
                      {
                        icon: <Activity className="h-5 w-5 text-neutral-400" />,
                        label: "Trạng thái",
                        value: (
                          <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Đang hoạt động
                          </span>
                        ),
                      },
                    ].map((item, index, arr) => (
                      <div key={item.label}>
                        <div className="flex items-start gap-4 py-4">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-50">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                              {item.label}
                            </p>
                            <div className="mt-1 text-sm text-neutral-900">{item.value}</div>
                          </div>
                        </div>
                        {index < arr.length - 1 && <Separator />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Security Card */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="px-8 py-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                    <Lock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Bảo mật</h2>
                    <p className="text-sm text-neutral-500">Quản lý mật khẩu và bảo mật tài khoản</p>
                  </div>
                </div>
                {!showChangePassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePassword(true)}
                    className="gap-2"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Đổi mật khẩu
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showChangePassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <Separator className="mb-6" />
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium text-neutral-700">
                          Mật khẩu hiện tại
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPwd ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Nhập mật khẩu hiện tại"
                            className="pr-11 text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                          >
                            {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-neutral-700">
                          Mật khẩu mới
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPwd ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Tối thiểu 8 ký tự"
                            className="pr-11 text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPwd(!showNewPwd)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                          >
                            {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowChangePassword(false)}
                        >
                          Hủy
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleChangePassword}
                          disabled={isMutating || !currentPassword || !newPassword}
                        >
                          {isMutating ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <KeyRound className="mr-1.5 h-4 w-4" />
                          )}
                          Xác nhận
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
