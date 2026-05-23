"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

const tourSteps: Record<string, Array<{ element: string; popover: { title: string; description: string; side?: "top" | "bottom" | "left" | "right" } }>> = {
  "/login": [
    {
      element: "#tour-login-form",
      popover: { title: "Đăng nhập", description: "Nhập thông tin tài khoản để truy cập hệ thống Logistics Mail.", side: "bottom" },
    },
    {
      element: "#tour-login-email",
      popover: { title: "Email", description: "Nhập địa chỉ email của bạn tại đây.", side: "right" },
    },
    {
      element: "#tour-login-password",
      popover: { title: "Mật khẩu", description: "Nhập mật khẩu để đăng nhập.", side: "right" },
    },
    {
      element: "#tour-login-btn",
      popover: { title: "Đăng nhập", description: "Click để vào hệ thống.", side: "top" },
    },
  ],
  "/": [
    {
      element: "#tour-sidebar",
      popover: { title: "Thanh điều hướng", description: "Truy cập nhanh các trang chính: Dashboard, Email, Báo cáo và Quản trị.", side: "right" },
    },
    {
      element: "#tour-dashboard-stats",
      popover: { title: "Thống kê", description: "Xem tổng quan số lượng email, chờ xử lý, đã hoàn tất và lỗi.", side: "bottom" },
    },
    {
      element: "#tour-dashboard-recent",
      popover: { title: "Email gần đây", description: "Danh sách email vừa được đồng bộ. Click để xem chi tiết.", side: "top" },
    },
  ],
  "/emails": [
    {
      element: "#tour-emails-search",
      popover: { title: "Tìm kiếm", description: "Tìm email theo tiêu đề hoặc người gửi.", side: "bottom" },
    },
    {
      element: "#tour-emails-filter",
      popover: { title: "Bộ lọc", description: "Lọc email theo trạng thái: tất cả, chưa xử lý, đã xử lý, có đính kèm.", side: "bottom" },
    },
    {
      element: "#tour-emails-table",
      popover: { title: "Danh sách Email", description: "Danh sách email đã đồng bộ. Click 'Xử lý' để mở chi tiết.", side: "top" },
    },
  ],
  "/emails/1": [
    {
      element: "#tour-email-header",
      popover: { title: "Thông tin email", description: "Xem người gửi, tiêu đề và thời gian nhận email.", side: "bottom" },
    },
    {
      element: "#tour-email-body",
      popover: { title: "Nội dung", description: "Đọc nội dung chính của email tại đây.", side: "top" },
    },
    {
      element: "#tour-email-attachments",
      popover: { title: "Tệp đính kèm", description: "Kiểm tra tệp đính kèm hợp lệ trước khi gửi AI.", side: "top" },
    },
    {
      element: "#tour-email-ai-btn",
      popover: { title: "Gửi AI bóc tách", description: "Click để AI phân tích và trích xuất dữ liệu từ email.", side: "left" },
    },
  ],
  "/emails/1/extract": [
    {
      element: "#tour-extract-result",
      popover: { title: "Kết quả bóc tách", description: "Dữ liệu AI đã trích xuất. Kiểm tra độ tin cậy và thông tin còn thiếu.", side: "bottom" },
    },
    {
      element: "#tour-extract-fields",
      popover: { title: "Chỉnh sửa dữ liệu", description: "Bạn có thể chỉnh sửa trực tiếp các trường dữ liệu trước khi export.", side: "top" },
    },
    {
      element: "#tour-extract-export",
      popover: { title: "Export Excel", description: "Xuất dữ liệu đã bóc tách ra file Excel.", side: "left" },
    },
  ],
  "/reports": [
    {
      element: "#tour-reports-stats",
      popover: { title: "Thống kê báo cáo", description: "Tổng quan số bản ghi, giá trị và bản ghi tháng này.", side: "bottom" },
    },
    {
      element: "#tour-reports-table",
      popover: { title: "Dữ liệu đã import", description: "Xem toàn bộ dữ liệu logistics đã import vào hệ thống.", side: "top" },
    },
    {
      element: "#tour-reports-import-btn",
      popover: { title: "Import mới", description: "Upload file Excel để thêm dữ liệu mới vào báo cáo.", side: "bottom" },
    },
  ],
  "/reports/import": [
    {
      element: "#tour-import-upload",
      popover: { title: "Upload file", description: "Chọn file Excel hoặc CSV để import.", side: "bottom" },
    },
    {
      element: "#tour-import-preview",
      popover: { title: "Preview", description: "Xem trước dữ liệu (10 dòng đầu) trước khi import.", side: "top" },
    },
    {
      element: "#tour-import-btn",
      popover: { title: "Thực hiện Import", description: "Click để import dữ liệu vào báo cáo tổng.", side: "top" },
    },
  ],
  "/admin/users": [
    {
      element: "#tour-users-table",
      popover: { title: "Danh sách tài khoản", description: "Quản lý nhân viên và admin. Xem vai trò và ngày tạo.", side: "top" },
    },
    {
      element: "#tour-users-add",
      popover: { title: "Thêm tài khoản", description: "Tạo tài khoản mới cho nhân viên.", side: "left" },
    },
  ],
  "/admin/settings": [
    {
      element: "#tour-settings-gmail",
      popover: { title: "Gmail", description: "Kết nối và cấu hình tài khoản Gmail đồng bộ email.", side: "bottom" },
    },
    {
      element: "#tour-settings-ai",
      popover: { title: "AI / Rule Engine", description: "Tùy chỉnh prompt và pattern lọc tiêu đề email.", side: "top" },
    },
  ],
  "/admin/logs": [
    {
      element: "#tour-logs-filter",
      popover: { title: "Lọc logs", description: "Lọc theo mức độ: lỗi, cảnh báo, thông tin.", side: "bottom" },
    },
    {
      element: "#tour-logs-table",
      popover: { title: "Danh sách Logs", description: "Xem lịch sử lỗi đồng bộ, AI và import để debug.", side: "top" },
    },
  ],
}

export function useTour() {
  const pathname = usePathname()

  const startTour = useCallback(() => {
    const steps = tourSteps[pathname]
    if (!steps || steps.length === 0) return

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps,
      nextBtnText: "Tiếp",
      prevBtnText: "Trước",
      doneBtnText: "Xong",
      progressText: "{{current}} / {{total}}",
      overlayColor: "rgba(0,0,0,0.6)",
    })

    driverObj.drive()
  }, [pathname])

  useEffect(() => {
    // Auto-start tour on first visit per session (optional, using sessionStorage)
    const visited = sessionStorage.getItem(`tour-${pathname}`)
    if (!visited) {
      // Delay slightly to ensure DOM is ready
      const timer = setTimeout(() => {
        startTour()
        sessionStorage.setItem(`tour-${pathname}`, "true")
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [pathname, startTour])

  return { startTour }
}
