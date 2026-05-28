"use client"
// ADMIN ROUTE: Quản lý quyền hạn (permissions) — chỉ admin

import { useState } from "react"
import { Loader, Pencil, Plus, Shield, Trash2 } from "lucide-react"
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
  usePermissionsQuery,
  usePermissionModulesQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from "@/hooks/use-permissions-queries"

export default function AdminPermissionsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [formCode, setFormCode] = useState("")
  const [formName, setFormName] = useState("")
  const [formModule, setFormModule] = useState("")
  const [formDescription, setFormDescription] = useState("")

  const permissionsQuery = usePermissionsQuery()
  const modulesQuery = usePermissionModulesQuery()
  const createMutation = useCreatePermissionMutation()
  const updateMutation = useUpdatePermissionMutation()
  const deleteMutation = useDeletePermissionMutation()

  const permissions = Array.isArray(permissionsQuery.data)
    ? permissionsQuery.data
    : permissionsQuery.data?.data ?? []

  const modules = Array.isArray(modulesQuery.data)
    ? modulesQuery.data
    : modulesQuery.data?.data ?? []

  const openCreate = () => {
    setModalMode("create")
    setSelectedId(null)
    setFormCode("")
    setFormName("")
    setFormModule("")
    setFormDescription("")
    setModalOpen(true)
  }

  const openEdit = (item: unknown) => {
    const p = item as Record<string, unknown>
    setModalMode("edit")
    setSelectedId((p.id as string) ?? null)
    setFormCode((p.code as string) ?? "")
    setFormName((p.name as string) ?? "")
    setFormModule((p.module as string) ?? "")
    setFormDescription((p.description as string) ?? "")
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync({ code: formCode, name: formName, module: formModule, description: formDescription })
        toast.success("Tạo quyền thành công.")
      } else if (selectedId) {
        await updateMutation.mutateAsync({ id: selectedId, payload: { name: formName, description: formDescription, module: formModule } })
        toast.success("Cập nhật quyền thành công.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại."))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa quyền này?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Đã xóa quyền.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Xóa thất bại."))
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-300">Quản lý Quyền hạn</h1>
        <button
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" /> Tạo quyền
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Tìm theo tên hoặc code..." className="w-64" />
      </div>

      {modules.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {modules.map((m: unknown) => (
            <Badge key={String(m)} variant="outline" className="bg-white">
              {String(m)}
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-white/80">Code</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Tên</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Module</th>
                <th className="px-4 py-3 text-left font-medium text-white/80">Mô tả</th>
                <th className="px-4 py-3 text-right font-medium text-white/80"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/15">
              {permissionsQuery.isPending && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    <Loader className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Đang tải...</p>
                  </td>
                </tr>
              )}
              {!permissionsQuery.isPending && permissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-200">
                    Không có quyền nào.
                  </td>
                </tr>
              )}
              {permissions.map((item: unknown) => {
                const p = item as Record<string, unknown>
                return (
                  <tr key={String(p.id ?? p.code)} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-300">{String(p.code ?? "—")}</td>
                    <td className="px-4 py-3 text-neutral-300">{String(p.name ?? "—")}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {String(p.module ?? "—")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{String(p.description ?? "—")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-neutral-100 bg-white text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(String(p.id))}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-black">
              {modalMode === "create" ? "Tạo quyền mới" : "Cập nhật quyền"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-neutral-300">Code</Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                disabled={modalMode === "edit"}
                placeholder="users:create"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Tên</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Tạo tài khoản"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Module</Label>
              <Input
                value={formModule}
                onChange={(e) => setFormModule(e.target.value)}
                placeholder="users"
                className="text-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300">Mô tả</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Cho phép tạo tài khoản mới"
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
    </div>
  )
}
