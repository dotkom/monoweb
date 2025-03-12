import type { Attendee } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import type { FC } from "react"

interface Props {
  attendee: Attendee | null
  handleGatherExtrasChoices: () => void
}

export const ExtrasOverviewBox: FC<Props> = ({ attendee, handleGatherExtrasChoices }) => {
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
          {attendee?.extrasChoices?.map((choice) => (
            <tr key={choice.questionId}>
              <td className="text-left">{choice.questionName}</td>
              <td className="text-left">{choice.choiceName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button className="mt-2 w-32" variant={"outline"} onClick={handleGatherExtrasChoices}>
        Endre
      </Button>
    </div>
  )
}
