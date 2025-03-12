import type { FC } from "react"

type QuoteDisplayProps = {
  quote: string
  name: string
  year: number
  className?: string
}

const QuoteDisplay: FC<QuoteDisplayProps> = ({ quote, name, year, className }) => {
  return (
    <div className={`px-16 items-center justify-center ${className}`}>
      <p className="text-slate-10">{quote}</p>
      <p className="text-slate-10">
        - {name} {year}
      </p>
    </div>
  )
}

export default QuoteDisplay
