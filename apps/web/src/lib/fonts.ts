import { Figtree, Google_Sans_Code, Inter, Marcellus } from "next/font/google"

export const bodyFont = Inter({ subsets: ["latin"], variable: "--font-body" })
export const titleFont = Figtree({ subsets: ["latin"], variable: "--font-title" })
export const monospaceFont = Google_Sans_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  fallback: ["monospace"],
})
export const marcellusFont = Marcellus({ subsets: ["latin"], variable: "--font-marcellus", weight: ["400"] })
