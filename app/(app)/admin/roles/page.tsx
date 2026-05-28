"use client"
// ADMIN ROUTE: Quản lý vai trò (roles) và phân quyền — chỉ admin

import { useState, useEffect } from "react"
import { Loader, Pencil, Plus, Shield, Trash2, Check, X } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage } from "@/lib/get-error-message"
import {
  useRolesQuery,
  useRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from "@/hooks/use-roles-queries"
import {
  usePermissionsQuery,
} from "@/hooks/use-permissions-queries"

export default function AdminRolesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [formCode, setFormCode] = useState("")
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")

  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<string | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])

  const rolesQuery = useRolesQuery()
  const createMutation = useCreateRoleMutation()
  const updateMutation = useUpdateRoleMutation()
  const deleteMutation = useDeleteRoleMutation()

  const permissionsQuery = usePermissionsQuery()
  const rolePermissionsQuery = useRolePermissionsQuery(selectedRoleForPermissions)
  const updateRolePermissionsMutation = useUpdateRolePermissionsMutation()

  const roles = Array.isArray(rolesQuery.data)
    ? rolesQuery.data
    : rolesQuery.data?.data ?? []

  const allPermissions = Array.isArray(permissionsQuery.data)
    ? permissionsQuery.data
    : permissionsQuery.data?.data ?? []

  const currentRolePermissions = Array.isArray(rolePermissionsQuery.data)
    ? rolePermissionsQuery.data
    : rolePermissionsQuery.data?.data ?? []

  const openCreate = () => {
    setModalMode("create")
    setSelectedId(null)
    setFormCode("")
    setFormName("")
    setFormDescription("")
    setModalOpen(true)
  }

  const openEdit = (item: unknown) => {
    const r = item as Record<string, unknown>
    setModalMode("edit")
    setSelectedId((r.id as string) ?? null)
    setFormCode((r.code as string) ?? "")
    setFormName((r.name as string) ?? "")
    setFormDescription((r.description as string) ?? "")
    setModalOpen(true)
  }

  const openPermissions = (roleId: string) => {
    setSelectedRoleForPermissions(roleId)
    setSelectedPermissionIds([])
    setPermissionsModalOpen(true)
  }

  useEffect(() => {
    if (rolePermissionsQuery.data && selectedRoleForPermissions) {
      const raw = rolePermissionsQuery.data
      let perms: unknown[] = []
      if (Array.isArray(raw)) {
        perms = raw
      } else if (raw && typeof raw === "object") {
        const d = raw as Record<string, unknown>
        if (Array.isArray(d.data)) perms = d.data
      }
      const currentIds = perms
        .map((p: unknown) => (p as Record<string, unknown>).id as string)
        .filter(Boolean)
      setSelectedPermissionIds(currentIds)
    }
  }, [rolePermissionsQuery.data, selectedRoleForPermissions])

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({ code: formCode, name: formName, description: formDescription })
        toast.success("Tạo vai trò thành công.")
      } else if (selectedId) {
        await updateMutation.mutateAsync({ id: selectedId, payload: { name: formName, description: formDescription } })
        toast.success("Cập nhật vai trò thành công.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa vai trò này?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Đã xóa vai trò.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa thất bại."))
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedRoleForPermissions) return
    try {
      await updateRolePermissionsMutation.mutateAsync({
        id: selectedRoleForPermissions,
        payload: { permissionIds: selectedPermissionIds },
      })
      toast.success("Cập nhật quyền cho vai trò thành công.")
      setPermissionsModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Cập nhật quyền thất bại."))
    }
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Vai trò</h1>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" /> Tạo vai trò
        </button>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Code</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Tên</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Mô tả</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Quyền</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {rolesQuery.isPending && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!rolesQuery.isPending && roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    Không có vai trò nào.
                  </td>
                </tr>
              )}
              {roles.map((item: unknown) => {
                const r = item as Record<string, unknown>
                return (
                  <tr key={String(r.id ?? r.code)} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-300">{String(r.code ?? "—")}</td>
                    <td className="px-4 py-3 text-neutral-300">{String(r.name ?? "—")}</td>
                    <td className="px-4 py-3 text-neutral-200">{String(r.description ?? "—")}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px]">
                          Click icon Shield để gán quyền
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openPermissions(String(r.id))}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(String(r.id))}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Role Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {modalMode === "create" ? "Tạo vai trò mới" : "Cập nhật vai trò"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-neutral-300">Code</Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                disabled={modalMode === "edit"}
                placeholder="admin"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Tên</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Quản trị viên"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Mô tả</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Toàn quyền quản trị hệ thống"
                className="text-neutral-300"
              />
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

      {/* Permissions Assignment Modal */}
      <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">Gán quyền cho vai trò</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {allPermissions.map((item: unknown) => {
              const p = item as Record<string, unknown>
              const pid = String(p.id)
              const checked = selectedPermissionIds.includes(pid)
              return (
                <div
                  key={pid}
                  onClick={() => togglePermission(pid)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    checked ? "border-primary bg-primary-50" : "border-neutral-100 hover:bg-neutral-50"
                  }`}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                    checked ? "border-primary bg-primary text-white" : "border-neutral-300"
                  }`}>
                    {checked && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-300">{String(p.name)}</p>
                    <p className="text-xs text-neutral-200">{String(p.code)} · {String(p.module)}</p>
                  </div>
                </div>
              )
            })}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPermissionsModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSavePermissions}
                disabled={updateRolePermissionsMutation.isPending}
              >
                {updateRolePermissionsMutation.isPending ? (
                  <Loader className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
