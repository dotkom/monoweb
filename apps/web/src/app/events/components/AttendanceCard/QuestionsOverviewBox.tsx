import type { Attendee } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import type { FC } from "react"

interface Props {
  attendee: Attendee | null
  handleGatherQuestionsChoices: () => void
}

export const QuestionsOverviewBox: FC<Props> = ({ attendee, handleGatherQuestionsChoices }) => {
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
          {attendee?.questionResponses?.map((response) => (
            <tr key={response.questionId}>
              <td className="text-left">{response.questionName}</td>
              <td className="text-left">{response.choiceName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button className="mt-2 w-32" variant={"outline"} onClick={handleGatherQuestionsChoices}>
        Endre
      </Button>
    </div>
  )
}
