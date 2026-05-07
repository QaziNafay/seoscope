import { NextRequest, NextResponse } from "next/server"
import { analyzePage } from "@/lib/analyze"

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    let normalized = url.trim()
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized
    }

    try {
      new URL(normalized)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    const result = await analyzePage(normalized)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze page"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
