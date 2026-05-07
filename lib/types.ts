export interface MetaResult {
  title: string | null
  titleLength: number
  description: string | null
  descriptionLength: number
  keywords: string | null
  canonical: string | null
  robots: string | null
  viewport: string | null
  charset: string | null
  favicon: string | null
}

export interface HeadingResult {
  h1: string[]
  h2: string[]
  h3: string[]
  issues: string[]
}

export interface ImageResult {
  src: string
  alt: string | null
  hasAlt: boolean
}

export interface LinkResult {
  href: string
  text: string
  isInternal: boolean
  isFollowable: boolean
}

export interface SocialResult {
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  ogUrl: string | null
  twitterCard: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
}

export interface KeywordResult {
  word: string
  count: number
  density: number
}

export interface TechnicalSeoItem {
  label: string
  status: "pass" | "warn" | "fail" | "info"
  value: string
  detail: string
}

export interface TechnicalSeoResult {
  items: TechnicalSeoItem[]
}

export interface AnalysisResult {
  url: string
  score: number
  meta: MetaResult
  headings: HeadingResult
  images: ImageResult[]
  links: LinkResult[]
  technical: TechnicalSeoResult
  keywords: KeywordResult[]
  wordCount: number
  recommendations: string[]
  loadTime: number
}
