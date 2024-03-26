import { Committee } from "@dotkomonline/types"
import { FC } from "react"

interface Props {
  location: string
}

export const LocationBox: FC<Props> = ({ location }) => {
  return (
    <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
      <h2>Oppmøte</h2>
      <p>{location}</p>
    </div>
  )
}
