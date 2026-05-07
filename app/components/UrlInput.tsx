"use client"

import { useState, FormEvent } from "react"

interface Props {
  onSubmit: (url: string) => void
  loading: boolean
}

export function UrlInput({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (url.trim()) onSubmit(url.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-2xl mx-auto">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Analyzing…" : "Analyze"}
      </button>
    </form>
  )
}
