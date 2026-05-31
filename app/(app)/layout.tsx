"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  type LucideIcon,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileCode,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Settings as SettingsIcon,
  Shield,
  User,
  Users,
  ClipboardList,
  Inbox,
  Webhook,
  ClipboardCheck,
  Monitor,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"
import { usePermissions } from "@/hooks/use-permission"
import TourButton from "@/components/tour-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "sonner"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  permission?: string
}

const getBreadcrumbItems = (pathname: string) => {
  if (pathname === "/") return [{ label: "Dashboard", href: "/" }]

  if (pathname.startsWith("/analysis-results")) {
    return [{ label: "Kết quả AI", href: "/analysis-results" }]
  }

  // if (pathname.startsWith("/webhooks")) {
  //   return [{ label: "Webhooks", href: "/webhooks" }]
  // }

  if (pathname.startsWith("/mail-accounts")) {
    return [{ label: "Tài khoản Email", href: "/mail-accounts" }]
  }

  if (pathname.startsWith("/emails")) {
    if (pathname === "/emails") return [{ label: "Email", href: "/emails" }]
    if (pathname.includes("/extract")) {
      return [
        { label: "Email", href: "/emails" },
        { label: "Chi tiết", href: "#" },
        { label: "Trích xuất", href: "#" },
      ]
    }

    return [
      { label: "Email", href: "/emails" },
      { label: "Chi tiết", href: "#" },
    ]
  }

  if (pathname.startsWith("/reports")) {
    if (pathname === "/reports") return [{ label: "Báo cáo", href: "/reports" }]
    if (pathname.includes("/import")) {
      return [
        { label: "Báo cáo", href: "/reports" },
        { label: "Import", href: "#" },
      ]
    }

    return [{ label: "Báo cáo", href: "/reports" }]
  }

  if (pathname.startsWith("/user")) {
    return [{ label: "Tài khoản", href: "/user" }]
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin") {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Admin Tổng", href: "#" },
      ]
    }
    if (pathname.includes("/users")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Tài khoản", href: "#" },
      ]
    }
    if (pathname.includes("/settings")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Cấu hình", href: "#" },
      ]
    }
    if (pathname.includes("/logs")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Logs", href: "#" },
      ]
    }
    if (pathname.includes("/templates")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Templates", href: "#" },
      ]
    }
    if (pathname.includes("/permissions")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Quyền hạn", href: "#" },
      ]
    }
    if (pathname.includes("/roles")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Vai trò", href: "#" },
      ]
    }
    if (pathname.includes("/assignments")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "Phân công", href: "#" },
      ]
    }
    if (pathname.includes("/ai-usage")) {
      return [
        { label: "Quản trị", href: "#" },
        { label: "AI Usage", href: "#" },
      ]
    }
    return [{ label: "Quản trị", href: "#" }]
  }

  if (pathname.startsWith("/ceo")) {
    return [{ label: "CEO Dashboard", href: "/ceo" }]
  }

  if (pathname.startsWith("/employees")) {
    const employeeId = pathname.split("/")[2]
    if (employeeId) {
      return [
        { label: "Nhân viên", href: "/employees" },
        { label: employeeId, href: "#" },
      ]
    }

    return [{ label: "Nhân viên", href: "/employees" }]
  }

  return [{ label: "Trang chủ", href: "/" }]
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [mounted, setMounted] = useState(false)
  const breadcrumbItems = getBreadcrumbItems(pathname)
  const { logout } = useAuth()
  const authUser = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.isAdmin)()
  const { codes: apiPermissionCodes } = usePermissions([])

  const userPermissions = apiPermissionCodes.length > 0
    ? apiPermissionCodes
    : (authUser?.permissions ?? [])

  const baseNavItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/mail-accounts", label: "Tài khoản Email", icon: Inbox, permission: "mail.read" },
    { href: "/analysis-results", label: "Kết quả AI", icon: ClipboardList, permission: "mail.read" },
    { href: "/templates", label: "Templates", icon: FileCode },
    { href: "/reports", label: "Báo cáo", icon: BarChart3, permission: "report.view" },
    { href: "/sessions", label: "Quản lý phiên", icon: Monitor },
  ]

  const navItems: NavItem[] = [
    ...baseNavItems.slice(0, 2),
    { href: "/emails", label: "Email", icon: Mail, permission: "mail.read" },
    { href: "/drafts", label: "Hồ sơ xử lý", icon: FileText, permission: "mail.read" },
    { href: "/ceo", label: "CEO Dashboard", icon: Crown },
    ...baseNavItems.slice(2),
  ]

  const adminItems: NavItem[] = [
    { href: "/admin", label: "Admin Tổng", icon: Shield },
    { href: "/admin/users", label: "Tài khoản", icon: Users },
    { href: "/admin/permissions", label: "Quyền hạn", icon: Shield },
    { href: "/admin/roles", label: "Vai trò", icon: User },
    { href: "/admin/assignments", label: "Phân công", icon: ClipboardCheck },
    { href: "/admin/ai-usage", label: "AI Usage", icon: BarChart3 },
    { href: "/admin/settings", label: "Cấu hình", icon: Settings },
    { href: "/admin/logs", label: "Logs", icon: FileText },
    { href: "/admin/templates", label: "Templates", icon: FileCode },
  ]

  useEffect(() => {
    setMounted(true)
    setHasHydrated(useAuthStore.persist.hasHydrated())
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    return unsubscribe
  }, [])

  // Redirect non-admin users away from admin routes
  useEffect(() => {
    if (!hasHydrated) return
    if (!isAdmin && pathname.startsWith("/admin")) {
      router.replace("/login")
    }
  }, [hasHydrated, isAdmin, pathname, router])

  const handleLogout = () => {
    logout()
  }

  const [navMounted, setNavMounted] = useState(false)
  useEffect(() => {
    setNavMounted(true)
  }, [])

  const renderNavItem = (item: NavItem) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/")
    const linkContent = (
      <>
        {active && (
          <span
            aria-hidden
            className={cn(
              "absolute left-0 top-2 bottom-2 w-px bg-white",
              collapsed && "left-1/2 top-auto bottom-1 h-px w-6 -translate-x-1/2"
            )}
          />
        )}
        <item.icon
          className={cn(
            "h-5 w-5 shrink-0",
            active ? "text-white" : "text-neutral-100 group-hover:text-white"
          )}
        />
        {!collapsed && <span>{item.label}</span>}
      </>
    )

    const linkClass = cn(
      "group relative flex min-h-11 items-center gap-3 rounded-[10px] border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
      collapsed && "justify-center px-0",
      active
        ? "z-30 border-white/10 bg-white/10 text-white"
        : "text-neutral-100 hover:bg-white/10 hover:text-white"
    )

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      router.push(item.href)
    }

    const navItem = (
      <a
        key={item.href}
        href={item.href}
        {...(navMounted ? { onClick: handleNavClick } : {})}
        className={linkClass}
      >
        {linkContent}
      </a>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return navItem
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-neutral-50 p-4">
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden">
          <aside
            id="tour-sidebar"
            className={cn(
              "relative z-20 flex h-full max-h-[920px] flex-col rounded-[12px] border border-neutral-200/10 bg-primary transition-all duration-300",
              collapsed ? "w-16" : "w-64"
            )}
          >
            <div className="relative flex h-16 items-center gap-3 border-b border-neutral-200/10 px-4 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-neutral-200/10 bg-white/10">
                <Mail className="h-5 w-5 shrink-0 text-white" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="block truncate text-lg font-semibold tracking-tight text-white">Logistics</span>
                  <span className="block text-xs uppercase tracking-[0.18em] text-neutral-100">Operations Desk</span>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <nav className="space-y-1.5 p-3">
                {navItems.map((item) => {
                  if (!navMounted) {
                    return <a key={item.href} href={item.href} className="hidden" />
                  }
                  const hidden = isAdmin && item.label === "Email"
                  const noPermission = item.permission && !userPermissions.includes(item.permission) && !isAdmin
                  if (hidden || noPermission) {
                    return <a key={item.href} href={item.href} className="hidden" />
                  }
                  return renderNavItem(item)
                })}

                {mounted && hasHydrated && isAdmin && (
                  <>
                    {!collapsed && (
                      <div className="px-3 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-100">
                        Quản trị
                      </div>
                    )}
                    {collapsed && <Separator className="my-3 bg-neutral-200/20" />}
                    {adminItems.map(renderNavItem)}
                  </>
                )}
              </nav>
            </ScrollArea>

            <div className="space-y-1 border-t border-neutral-200/10 p-3 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-neutral-100 transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    {!collapsed && "Thu gọn"}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{collapsed ? "Mở rộng" : "Thu gọn"}</p>
                </TooltipContent>
              </Tooltip>

            </div>
          </aside>

          <div className="relative z-10 ml-4 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[12px] border border-neutral-100 bg-white">
            <header className="relative flex h-16 shrink-0 items-center justify-between bg-white border-b border-neutral-100 px-6">
              <Breadcrumb>
                <BreadcrumbList className="text-neutral-200">
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={`${item.href}-${item.label}`}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbItems.length - 1 ? (
                          <BreadcrumbPage className="text-neutral-300 font-medium">{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href} className="hover:text-neutral-300 transition-colors cursor-pointer">{item.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative rounded-full bg-neutral-50 p-2.5 transition-colors hover:bg-neutral-100 cursor-pointer">
                      <Bell className="h-5 w-5 text-neutral-300" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-white">
                        3
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Email mới từ ABC Logistics</p>
                        <p className="text-[11px] text-neutral-200 truncate">Invoice #INV-001 đã được nhận</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">2p</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Import thành công</p>
                        <p className="text-[11px] text-neutral-200 truncate">25 bản ghi đã được import</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">1h</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md focus:bg-neutral-50">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-300">Cảnh báo hệ thống</p>
                        <p className="text-[11px] text-neutral-200 truncate">Tỷ lệ xử lý giảm dưới 90%</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-neutral-200">3h</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                      Xem tất cả thông báo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 rounded-full border border-neutral-100 bg-white px-2 py-1.5 transition-colors hover:bg-neutral-50 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-50 text-primary text-xs font-semibold">
                          {authUser?.fullName
                            ? authUser.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden text-left sm:block pr-1">
                        <p className="text-sm font-medium text-neutral-300">{authUser?.fullName || "User"}</p>
                        <p className="text-[11px] text-neutral-200">{authUser?.email || ""}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/user" className="flex cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>Hồ sơ</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/sessions" className="flex cursor-pointer items-center">
                        <Monitor className="mr-2 h-4 w-4 text-primary" />
                        <span>Quản lý phiên</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings" className="flex cursor-pointer items-center">
                          <SettingsIcon className="mr-2 h-4 w-4 text-primary" />
                          <span>Cài đặt hệ thống</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-accent cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="relative flex-1 overflow-auto px-8 py-7">
              <div key={pathname} className="route-shell-reveal relative">
                {children}
              </div>
            </main>
          </div>

          <TourButton />
          <Toaster
            position="top-right"
            toastOptions={{
              className: "text-sm",
            }}
            richColors
          />
        </div>
      </div>
    </TooltipProvider>
  )
}


