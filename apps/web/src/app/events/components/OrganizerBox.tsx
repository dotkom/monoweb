import type { Committee } from "@dotkomonline/types"
import type { FC } from "react"

interface Props {
  committees: Committee[]
}

export const OrganizerBox: FC<Props> = ({ committees }) => {
  return (
    <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
      <h2>Arrangør</h2>
      <table className="mx-auto mt-4">
        <tbody>
          <tr>
            <td className="p-4">Navn</td>
            <td className="p-4">{committees[0].name}</td>
          </tr>
          <tr>
            <td className="p-4">Epost</td>
            <td className="p-4">{committees[0].email}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
