"use client"

import { Button, Icon, Text, Title } from "@dotkomonline/ui"
import { hoursToSeconds } from "date-fns"
import { useState } from "react"

export const ConstructionNotice = () => {
  const [hidden, setHidden] = useState(false)

  const dismiss = () => {
    const oneWeekInHours = 24 * 7
    const maxAge = hoursToSeconds(oneWeekInHours)
    document.cookie = `hide-construction-notice=1; Max-Age=${maxAge}; Path=/; SameSite=Lax`
    setHidden(true)
  }

  if (hidden) {
    return null
  }

  return (
    <div className="relative flex flex-col gap-0 bg-yellow-100 dark:bg-amber-100 dark:text-black rounded-2xl">
      <div className="flex flex-row justify-between gap-4 pt-5 px-5 pb-4 bg-yellow-200 dark:bg-amber-200 dark:text-black rounded-t-2xl">
        <Title className="text-lg md:text-xl font-bold">🚧 Siden er under konstruksjon</Title>

        <Button
          onClick={dismiss}
          variant="text"
          className="-m-1 p-2 hover:bg-yellow-100 dark:hover:bg-amber-100 rounded-lg"
        >
          <Icon icon="tabler:x" className="text-xl dark:text-black" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6 pt-4 text-sm md:text-base rounded-b-2xl">
        <span className="inline-flex flex-row items-center gap-1">
          <Text>
            Vi jobber med å oppdatere{" "}
            <img
              src="/online-logo-o.svg"
              alt="Logo Online Linjeforening NTNU Trondheim"
              className="h-[1.75ch] w-[1.75ch] inline-block align-text-bottom"
            />{" "}
            OnlineWeb til en ny og bedre versjon. Det vil komme flere oppdateringer fremover, så følg med!
          </Text>
        </span>

        <span>
          <Text>
            Dersom du har tilbakemeldinger eller har funnet en feil, kan du sende en e-post til{" "}
            <Button
              variant="text"
              element="a"
              href="mailto:dotkom@online.ntnu.no"
              target="_blank"
              rel="noopener noreferrer"
              iconRight={<Icon icon="tabler:arrow-up-right" className="text-base" />}
              className="text-sm md:text-base font-semibold hover:bg-yellow-200 dark:text-black dark:hover:bg-amber-200"
            >
              dotkom@online.ntnu.no
            </Button>
          </Text>
        </span>
      </div>
    </div>
  )
}
