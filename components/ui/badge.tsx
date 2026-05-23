import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        {
          "border-transparent bg-blue-600 text-white shadow-sm": variant === "default",
          "border-transparent bg-blue-100 text-blue-900": variant === "secondary",
          "border-transparent bg-red-600 text-white shadow-sm": variant === "destructive",
          "text-blue-950 border-blue-200": variant === "outline",
          "border-transparent bg-green-100 text-green-700": variant === "success",
          "border-transparent bg-amber-100 text-amber-700": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
