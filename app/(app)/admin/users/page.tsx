"use client"

import { useState } from "react"
import {
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRolesMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useResetUserPasswordMutation,
  type UserDto,
} from "@/hooks/use-user-queries"

const ALL_ROLES = ["admin", "user", "viewer", "editor"]

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<UserDto | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formFullName, setFormFullName] = useState("")
  const [formRoles, setFormRoles] = useState<string[]>(["viewer"])
  const [formIsActive, setFormIsActive] = useState(true)
  const [showFormPassword, setShowFormPassword] = useState(false)

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserDto | null>(null)

  const filtersParts: string[] = []
  if (search.trim()) {
    filtersParts.push(`email@=${search.trim()},fullName@=${search.trim()}`)
  }
  if (statusFilter === "active") filtersParts.push("isActive==true")
  if (statusFilter === "inactive") filtersParts.push("isActive==false")
  if (roleFilter !== "all") filtersParts.push(`role==${roleFilter}`)

  const params = {
    filters: filtersParts.join(",") || undefined,
    page,
    pageSize,
    sortField: "CreatedAtUtc",
    sortOrder: "desc",
  }

  const usersQuery = useUsersQuery(params)
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()
  const updateRolesMutation = useUpdateUserRolesMutation()
  const updateStatusMutation = useUpdateUserStatusMutation()
  const deleteMutation = useDeleteUserMutation()
  const restoreMutation = useRestoreUserMutation()
  const resetPasswordMutation = useResetUserPasswordMutation()

  const listData = usersQuery.data
  const users = listData?.data ?? []
  const pagination = listData?.meta?.pagination

  const openCreate = () => {
    setModalMode("create")
    setSelectedUser(null)
    setFormEmail("")
    setFormPassword("")
    setFormFullName("")
    setFormRoles(["viewer"])
    setFormIsActive(true)
    setModalOpen(true)
  }

  const openEdit = (user: UserDto) => {
    setModalMode("edit")
    setSelectedUser(user)
    setFormEmail(user.email)
    setFormPassword("")
    setFormFullName(user.fullName)
    setFormRoles(user.roles)
    setFormIsActive(user.isActive)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({
          email: formEmail,
          password: formPassword,
          fullName: formFullName,
          roles: formRoles,
        })
        toast.success("Tạo tài khoản thành công.")
      } else if (selectedUser) {
        await updateMutation.mutateAsync({
          id: selectedUser.id,
          payload: { fullName: formFullName },
        })
        await updateRolesMutation.mutateAsync({
          id: selectedUser.id,
          payload: { roles: formRoles },
        })
        toast.success("Cập nhật tài khoản thành công.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  const handleToggleStatus = async (user: UserDto) => {
    try {
      await updateStatusMutation.mutateAsync({ id: user.id, isActive: !user.isActive })
      toast.success(`${!user.isActive ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công.`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật trạng thái thất bại."))
    }
  }

  const openDeleteConfirm = (user: UserDto) => {
    setConfirmDeleteUser(user)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteUser) return
    try {
      await deleteMutation.mutateAsync(confirmDeleteUser.id)
      toast.success("Đã xóa tài khoản.")
      setConfirmDeleteOpen(false)
      setConfirmDeleteUser(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa tài khoản thất bại."))
    }
  }

  const handleRestore = async (user: UserDto) => {
    try {
      await restoreMutation.mutateAsync(user.id)
      toast.success("Khôi phục tài khoản thành công.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Khôi phục thất bại."))
    }
  }

  const openResetPassword = (user: UserDto) => {
    setResetPasswordUser(user)
    setNewPassword("")
    setResetPasswordOpen(true)
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return
    try {
      await resetPasswordMutation.mutateAsync({
        id: resetPasswordUser.id,
        payload: { newPassword },
      })
      toast.success("Reset mật khẩu thành công.")
      setResetPasswordOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Reset mật khẩu thất bại."))
    }
  }

  const toggleRole = (role: string) => {
    setFormRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateRolesMutation.isPending ||
    updateStatusMutation.isPending ||
    deleteMutation.isPending ||
    restoreMutation.isPending ||
    resetPasswordMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Tài khoản</h1>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" /> Tạo tài khoản
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo email hoặc tên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-neutral-100 bg-white px-3 text-sm text-neutral-300 focus:border-primary focus:outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-neutral-100 bg-white px-3 text-sm text-neutral-300 focus:border-primary focus:outline-none"
        >
          <option value="all">Tất cả vai trò</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Email</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Họ tên</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {usersQuery.isPending && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!usersQuery.isPending && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-200">
                    Không có tài khoản nào.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-300">{user.email}</td>
                  <td className="px-4 py-3 text-neutral-300">{user.fullName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className={
                            role === "admin"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : role === "user"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle className="h-3 w-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        <XCircle className="h-3 w-3" /> Không hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">
                    {user.createdAtUtc
                      ? dayjs(user.createdAtUtc).format("DD/MM/YYYY HH:mm")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        title="Sửa"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                      >
                        {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openResetPassword(user)}
                        title="Reset mật khẩu"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-amber-600"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(user)}
                        title="Xóa"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-200">
            Trang {pagination.page} / {pagination.totalPages} · {pagination.totalItems} tài khoản
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPreviousPage}
              className="rounded-lg border border-neutral-100 bg-white px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              className="rounded-lg border border-neutral-100 bg-white px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {modalMode === "create" ? "Tạo tài khoản mới" : "Cập nhật tài khoản"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-neutral-300">Email</Label>
              <Input
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                disabled={modalMode === "edit"}
                placeholder="user@example.com"
                className="text-neutral-300"
              />
            </div>
            {modalMode === "create" && (
              <div className="space-y-1">
                <Label className="text-neutral-300">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    type={showFormPassword ? "text" : "password"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự..."
                    className="pr-10 text-neutral-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300"
                  >
                    {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-neutral-300">Họ và tên</Label>
              <Input
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300">Vai trò</Label>
              <div className="flex flex-wrap gap-3">
                {ALL_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      checked={formRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <Label className="mb-0 text-neutral-300">Kích hoạt tài khoản</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isMutating}>
                {isMutating ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                {modalMode === "create" ? "Tạo" : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-black">Reset mật khẩu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-neutral-200">
              Tài khoản: <strong className="text-neutral-300">{resetPasswordUser?.email}</strong>
            </p>
            <div className="space-y-1">
              <Label className="text-neutral-300">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="pr-10 text-neutral-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleResetPassword} disabled={isMutating || !newPassword}>
                {isMutating ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-black">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-neutral-200">
              Bạn có chắc muốn xóa tài khoản{" "}
              <strong className="text-neutral-300">{confirmDeleteUser?.email}</strong>?<br />
              Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader className="mr-1 h-4 w-4 animate-spin" /> : null}
                Xóa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
