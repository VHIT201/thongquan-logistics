"use client"
// ADMIN ROUTE: Admin dashboard tổng — chỉ admin

import Link from "next/link"
import {
  Users,
  Settings,
  FileText,
  Shield,
  TrendingUp,
  AlertTriangle,
  Activity,
  FileCode,
  ClipboardCheck,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const adminCards = [
  {
    href: "/admin/users",
    title: "Quản lý tài khoản",
    description: "Thêm, sửa, xóa tài khoản người dùng và phân quyền",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary-50",
    count: "3 tài khoản",
  },
  {
    href: "/admin/permissions",
    title: "Quyền hạn",
    description: "Quản lý danh sách quyền hạn (permissions) theo module",
    icon: Shield,
    color: "text-purple-600",
    bg: "bg-purple-50",
    count: "Permission CRUD",
  },
  {
    href: "/admin/roles",
    title: "Vai trò",
    description: "Quản lý vai trò (roles) và gán quyền",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    count: "Role CRUD",
  },
  {
    href: "/admin/assignments",
    title: "Phân công",
    description: "Quản lý phân công xử lý email cho nhân viên",
    icon: ClipboardCheck,
    color: "text-teal-600",
    bg: "bg-teal-50",
    count: "Assignments",
  },
  {
    href: "/admin/settings",
    title: "Cấu hình hệ thống",
    description: "Cài đặt đồng bộ email, AI extraction, thông báo",
    icon: Settings,
    color: "text-green-600",
    bg: "bg-green-50",
    count: "12 cấu hình",
  },
  {
    href: "/admin/logs",
    title: "Logs & lỗi",
    description: "Nhật ký hoạt động, lỗi và cảnh báo hệ thống",
    icon: FileText,
    color: "text-amber-600",
    bg: "bg-amber-50",
    count: "4 bản ghi",
  },
  {
    href: "/admin/ai-usage",
    title: "AI Usage",
    description: "Theo dõi chi phí và token sử dụng AI theo user và thời gian",
    icon: TrendingUp,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    count: "Analytics",
  },
  {
    href: "/admin/templates",
    title: "Template email",
    description: "Quản lý mẫu bóc tách email, expected fields và điều kiện nhận diện",
    icon: FileCode,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    count: "Template CRUD",
  },
]

const systemStats = [
  { label: "Tổng người dùng", value: "3", icon: Users, color: "text-primary", bg: "bg-primary-50" },
  { label: "Admin", value: "1", icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Nhân viên", value: "2", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
  { label: "Cảnh báo", value: "2", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-300">Admin tổng</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systemStats.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{stat.label}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral-300">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full cursor-pointer border-neutral-100 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <CardDescription className="text-xs">{card.count}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-200">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Hoạt động gần đây
          </CardTitle>
          <CardDescription>Các thao tác quản trị mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Tạo tài khoản", target: "staff2@company.com", time: "20/04/2026", user: "Admin" },
              { action: "Cập nhật cấu hình", target: "Gmail sync", time: "19/04/2026", user: "Admin" },
              { action: "Đăng nhập hệ thống", target: "—", time: "22/05/2026 10:30", user: "Admin" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium text-neutral-300">{item.action}</p>
                    <p className="text-xs text-neutral-200">{item.target}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-200">{item.time}</p>
                  <p className="text-xs text-neutral-200">{item.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
