import PersonvernOptionAlle from "@/components/molecules/PersonvernOption/PersonvernOptionsAlle"
import { css, Toggle } from "@dotkomonline/ui"
import { blackA } from "@radix-ui/colors"
import { GridIcon } from "@radix-ui/react-icons"
import { SetStateAction, FC, ReactNode, useState, useEffect } from "react"

// import PersonvernOptionAlle from "./PersonvernOption"

const PersonvernOptionSide: FC = () => {
  return (
    <div className="bg-background flex w-full flex-col">
      <p className=" m-0 w-full flex-auto p-1 text-3xl font-normal not-italic">Personvern</p>
      <p className=" m-0 w-full flex-auto p-1 text-lg font-normal not-italic">
        Her kan du endre personverninnstillingene koblet til profilen din.
      </p>
      <PersonvernOptionAlle />
    </div>
  )
}

export default PersonvernOptionSide
