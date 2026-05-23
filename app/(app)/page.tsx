"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, CheckCircle, AlertTriangle, Clock, ArrowRight, TrendingUp, Package, DollarSign, BarChart3 } from "lucide-react"
import dayjs from "dayjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const stats = [
  { label: "Tổng email", value: 124, icon: Mail, color: "text-primary", bg: "bg-primary-50", change: "+12%" },
  { label: "Chờ xử lý", value: 18, icon: Clock, color: "text-amber-600", bg: "bg-[#FBF3DB]", change: "-5%" },
  { label: "Đã hoàn tất", value: 98, icon: CheckCircle, color: "text-green-600", bg: "bg-[#EDF3EC]", change: "+18%" },
  { label: "Lỗi / Từ chối", value: 8, icon: AlertTriangle, color: "text-red-600", bg: "bg-[#FDEBEC]", change: "-2%" },
]

const recentEmails = [
  { id: "1", subject: "Invoice #INV-001 - ABC Logistics", fromEmail: "billing@abclogistics.com", receivedAt: "2026-05-22T09:30:00Z", processStatus: "unprocessed" },
  { id: "2", subject: "Shipping confirmation XYZ-2026", fromEmail: "ops@xyzshipping.com", receivedAt: "2026-05-22T08:15:00Z", processStatus: "processed" },
  { id: "3", subject: "Freight quote request", fromEmail: "sales@globalfreight.com", receivedAt: "2026-05-21T16:45:00Z", processStatus: "unprocessed" },
  { id: "4", subject: "Cargo manifest - Voyage 4521", fromEmail: "manifest@ocean cargo.com", receivedAt: "2026-05-21T14:20:00Z", processStatus: "processed" },
  { id: "5", subject: "Delivery receipt #DR-8821", fromEmail: "receipts@fast delivery.com", receivedAt: "2026-05-21T11:00:00Z", processStatus: "processed" },
]

const emailTrendData = [
  { name: "T2", processed: 12, pending: 5, error: 1 },
  { name: "T3", processed: 18, pending: 8, error: 2 },
  { name: "T4", processed: 15, pending: 6, error: 0 },
  { name: "T5", processed: 22, pending: 4, error: 1 },
  { name: "T6", processed: 25, pending: 7, error: 3 },
  { name: "T7", processed: 20, pending: 5, error: 1 },
  { name: "CN", processed: 8, pending: 2, error: 0 },
]

const statusDistribution = [
  { name: "Đã xử lý", value: 98, color: "#22c55e" },
  { name: "Chờ xử lý", value: 18, color: "#3b82f6" },
  { name: "Lỗi", value: 8, color: "#ef4444" },
]

const topSenders = [
  { name: "ABC Logistics", count: 24, amount: "125M" },
  { name: "XYZ Shipping", count: 18, amount: "87M" },
  { name: "Global Freight", count: 15, amount: "152M" },
  { name: "Ocean Cargo", count: 12, amount: "45M" },
  { name: "Fast Delivery", count: 10, amount: "32M" },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-300 tracking-tight">Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          Cập nhật: {dayjs().format("DD/MM/YYYY HH:mm")}
        </Badge>
      </div>

      <div id="tour-dashboard-stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-200">{card.label}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-neutral-300">{card.value}</div>
                <Badge variant={card.change.startsWith("+") ? "success" : "warning"} className="text-xs">
                  {card.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Xu hướng xử lý email
            </CardTitle>
            <CardDescription>Số lượng email theo trạng thái trong 7 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emailTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="processed" stroke="#22c55e" strokeWidth={2} name="Đã xử lý" />
                <Line type="monotone" dataKey="pending" stroke="#3b82f6" strokeWidth={2} name="Chờ xử lý" />
                <Line type="monotone" dataKey="error" stroke="#ef4444" strokeWidth={2} name="Lỗi" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Phân bố trạng thái
            </CardTitle>
            <CardDescription>Tỷ lệ email theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-200">{item.name}</span>
                  </div>
                  <span className="font-medium text-neutral-300">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top người gửi
            </CardTitle>
            <CardDescription>5 người gửi email nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topSenders} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card id="tour-dashboard-recent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email gần đây
                </CardTitle>
                <CardDescription>5 email mới nhất</CardDescription>
              </div>
              <Link href="/emails">
                <Badge variant="outline" className="hover:bg-neutral-50 cursor-pointer">
                  Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-neutral-300 text-sm">{email.subject}</p>
                    <p className="text-xs text-neutral-200 mt-1">{email.fromEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs text-neutral-200">{dayjs(email.receivedAt).format("HH:mm")}</span>
                    <Badge variant={email.processStatus === "processed" ? "success" : "warning"} className="text-xs">
                      {email.processStatus === "processed" ? "Đã xử lý" : "Chờ xử lý"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan hệ thống</CardTitle>
              <CardDescription>Thống kê chi tiết về hoạt động hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary-50 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Tổng giá trị</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">364.5M VND</p>
                  <p className="text-xs text-neutral-200 mt-1">+15% so với tháng trước</p>
                </div>
                <div className="p-4 rounded-lg bg-[#EDF3EC] border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-[#346538]" />
                    <span className="text-sm font-medium text-[#346538]">Tỷ lệ thành công</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">94.2%</p>
                  <p className="text-xs text-neutral-200 mt-1">+2.3% so với tháng trước</p>
                </div>
                <div className="p-4 rounded-lg bg-[#FBF3DB] border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#956400]" />
                    <span className="text-sm font-medium text-[#956400]">Thời gian xử lý TB</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-300">2.4h</p>
                  <p className="text-xs text-neutral-200 mt-1">-0.5h so với tháng trước</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất xử lý</CardTitle>
              <CardDescription>Biểu đồ hiệu suất theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-primary-100">
                <p className="text-sm">Dữ liệu hiệu suất sẽ được hiển thị tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký hoạt động</CardTitle>
              <CardDescription>Lịch sử các hoạt động gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-primary-100">
                <p className="text-sm">Nhật ký hoạt động sẽ được hiển thị tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
