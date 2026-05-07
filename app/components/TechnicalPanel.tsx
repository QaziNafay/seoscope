"use client"

import { useState } from "react"
import type { TechnicalSeoResult } from "@/lib/types"

const STATUS_ICON: Record<string, string> = {
  pass: "✓",
  warn: "△",
  fail: "✗",
  info: "ⓘ",
}

const STATUS_COLOR: Record<string, string> = {
  pass: "text-green-600 border-green-200 bg-green-50",
  warn: "text-yellow-700 border-yellow-200 bg-yellow-50",
  fail: "text-red-600 border-red-200 bg-red-50",
  info: "text-blue-600 border-blue-200 bg-blue-50",
}

const STATUS_BG: Record<string, string> = {
  pass: "bg-green-50",
  warn: "bg-yellow-50",
  fail: "bg-red-50",
  info: "bg-blue-50",
}

interface Props {
  technical: TechnicalSeoResult
}

export function TechnicalPanel({ technical }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
        Technical SEO
      </h2>
      <div className="space-y-1.5">
        {technical.items.map((item, i) => {
          const isOpen = openIndex === i
          const colorClass = STATUS_COLOR[item.status] || STATUS_COLOR.info
          return (
            <div
              key={i}
              className={`border rounded-lg text-sm transition-colors ${isOpen ? colorClass : "border-gray-100 hover:border-gray-200"}`}
            >
              <button
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer"
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.status === "pass"
                      ? "bg-green-100 text-green-700"
                      : item.status === "warn"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.status === "fail"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {STATUS_ICON[item.status] || "?"}
                </span>
                <span className="font-medium text-gray-800 shrink-0 w-28">
                  {item.label}
                </span>
                <span className="text-gray-500 truncate flex-1">
                  {item.value}
                </span>
                <span className="text-gray-300 text-xs shrink-0 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className={`px-3 pb-3 pt-0 text-xs leading-relaxed ${item.status === "pass" ? "text-green-700" : item.status === "warn" ? "text-yellow-700" : item.status === "fail" ? "text-red-700" : "text-blue-700"}`}>
                  {item.detail}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
