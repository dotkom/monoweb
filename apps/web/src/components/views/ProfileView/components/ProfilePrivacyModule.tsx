import { Toggle } from "@dotkomonline/ui"
import { blackA } from "@radix-ui/colors"
import { GridIcon } from "@radix-ui/react-icons"
import { SetStateAction, FC, ReactNode, useState, useEffect } from "react"

import PersonvernOption from "./ProfileToggleOption"

export const personList = [
  { key: 0, optionsText: "Brukerprofil synlig for andre brukere", state: false },
  { key: 1, optionsText: "Vis brukernavn i brukerprofil", state: false },
  { key: 2, optionsText: "Vis epostadresse i brukerprofil", state: false },
  { key: 3, optionsText: "Vis telefonnummer i brukerprofil", state: false },
  { key: 4, optionsText: "Vis adresse i brukerprofil", state: false },
  { key: 5, optionsText: "Synlig på offentlige påmeldingslister", state: false },
  { key: 6, optionsText: "Tillate at bilder av deg på offentlige arrangementer kan legges ut", state: false },
]

const PrivacyModule: FC = () => {
  const [isChecked, setIsChecked] = useState<boolean>(false)

  useEffect(() => {
    console.log(isChecked)
  }, [isChecked])

  return (
    <div className="divide-slate-7 my-5 flex w-full flex-col divide-y">
      {personList.map((title) => {
        return <PersonvernOption key={title.key}>{title.optionsText}</PersonvernOption>
      })}
    </div>
  )
}

export default PrivacyModule