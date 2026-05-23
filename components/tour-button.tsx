"use client"

import { HelpCircle } from "lucide-react"
import { useTour } from "@/hooks/useTour"

export default function TourButton() {
  const { startTour } = useTour()

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      title="Hướng dẫn sử dụng"
    >
      <HelpCircle className="h-6 w-6" />
    </button>
  )
}
