import type { Attendee } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import type { FC } from "react"

interface Props {
  attendee: Attendee | null
  handleGatherSelectionsOptions: () => void
}

export const SelectionsOverviewBox: FC<Props> = ({ attendee, handleGatherSelectionsOptions }) => {
  return (
    <div className="mt-4">
      <h4 className="text-md font-bold">Dine valg</h4>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Spørsmål</th>
            <th className="text-left">Valg</th>
          </tr>
        </thead>
        <tbody>
          {attendee?.selectionResponses?.map((response) => (
            <tr key={response.selectionId}>
              <td className="text-left">{response.selectionName}</td>
              <td className="text-left">{response.optionName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button className="mt-2 w-32" variant={"outline"} onClick={handleGatherSelectionsOptions}>
        Endre
      </Button>
    </div>
  )
}
