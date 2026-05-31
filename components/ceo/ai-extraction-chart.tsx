"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { name: "Invoice", success: 450, review: 55, failed: 15 },
  { name: "Bill", success: 250, review: 45, failed: 15 },
  { name: "Booking", success: 170, review: 38, failed: 12 },
  { name: "Tờ khai", success: 110, review: 72, failed: 8 },
]

export function AiExtractionChart() {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
            cursor={{ fill: "#f9fafb" }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="success" name="Thành công" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="review" name="Cần review" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="failed" name="Lỗi" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
