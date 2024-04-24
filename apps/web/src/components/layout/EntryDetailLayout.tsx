import { cn } from "@dotkomonline/ui"
import type { FC, PropsWithChildren } from "react"

export interface EntryDetailLayoutProps {
  title: string
  subtitle?: string | string[]
}

export const EntryDetailLayout: FC<PropsWithChildren<EntryDetailLayoutProps>> = ({ children, title, subtitle }) => {
  if (subtitle && Array.isArray(subtitle)) {
    subtitle = subtitle.join(" • ")
  }

  return (
    <div className="mb-16 mx-auto flex flex-col gap-y-8">
      <div className="py-6 flex flex-col gap-y-3 border-b border-slate-6">
        <h1 className="text-5xl font-bold">{title}</h1>
        <span className="text-slate-10 rounded-lg">{subtitle}</span>
      </div>
      {children}
    </div>
  )
}
