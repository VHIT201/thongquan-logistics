import { Suspense } from "react"
import SettingsContent from "./settings-content"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-blue-700">Đang tải...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
