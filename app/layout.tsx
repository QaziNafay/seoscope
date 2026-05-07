import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SEOScope — Free SEO Analyzer",
  description:
    "Analyze any webpage for SEO issues. Get a score, meta tags analysis, heading structure, and actionable recommendations.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
