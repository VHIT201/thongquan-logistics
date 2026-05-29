import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  let decodedUrl: string
  try {
    decodedUrl = decodeURIComponent(url)
  } catch {
    return new NextResponse("Invalid url parameter", { status: 400 })
  }

  try {
    const response = await fetch(decodedUrl, {
      headers: { Accept: "*/*" },
    })

    if (!response.ok) {
      return new NextResponse(`Upstream error: ${response.status}`, {
        status: response.status,
      })
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream"
    const body = await response.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=1800",
      },
    })
  } catch (err) {
    console.error("[attachment-proxy] fetch error:", err)
    return new NextResponse("Failed to fetch file", { status: 502 })
  }
}
