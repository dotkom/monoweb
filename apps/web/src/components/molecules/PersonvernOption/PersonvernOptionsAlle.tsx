import { css, Toggle } from "@dotkomonline/ui"
import { blackA } from "@radix-ui/colors"
import { GridIcon } from "@radix-ui/react-icons"
import { SetStateAction, FC, ReactNode, useState, useEffect } from "react"

import PersonvernOption from "./PersonvernOption"

// interface PersonvernAlleProps {
//   children: ReactNode
// }

export const personList = [
  { key: 0, optionsText: "Brukerprofil synlig for andre brukere", state: false },
  { key: 1, optionsText: "Vis brukernavn i brukerprofil", state: false },
  { key: 2, optionsText: "Vis epostadresse i brukerprofil", state: false },
  { key: 3, optionsText: "Vis telefonnummer i brukerprofil", state: false },
  { key: 4, optionsText: "Vis adresse i brukerprofil", state: false },
  { key: 5, optionsText: "Synlig på offentlige påmeldingslister", state: false },
  { key: 6, optionsText: "Tillate at bilder av deg på offentlige arrangementer kan legges ut", state: false },
]

const PersonvernOptionAlle: FC = () => {
  const [isChecked, setIsChecked] = useState<boolean>(false)

  useEffect(() => {
    console.log(isChecked)
  }, [isChecked])

  return (
    <div className="mt-10 flex w-full flex-col">
      {personList.map((title) => {
        return <PersonvernOption key={title.key}>{title.optionsText}</PersonvernOption>
      })}
    </div>
  )
}

export default PersonvernOptionAlle
