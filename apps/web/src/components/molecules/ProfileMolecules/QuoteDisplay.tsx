import type { FC } from "react"

export type QuoteDisplayProps = {
  quote: string
  name: string
  year: number
  className?: string
}

export const QuoteDisplay: FC<QuoteDisplayProps> = ({ quote, name, year, className }) => {
  return (
    <div className={`px-16 items-center justify-center ${className}`}>
      <p className="text-gray-900">{quote}</p>
      <p className="text-gray-900">
        - {name} {year}
      </p>
    </div>
  )
}
