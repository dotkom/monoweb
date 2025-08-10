"use client"

import { Button, Icon, Text, Title } from "@dotkomonline/ui"
import { hoursToSeconds } from "date-fns"
import { useState } from "react"

export const FadderukeNotice = () => {
  const [hidden, setHidden] = useState(false)

  const dismiss = () => {
    const maxAge = hoursToSeconds(18)
    document.cookie = `hide-fadderuke-notice=1; Max-Age=${maxAge}; Path=/; SameSite=Lax`
    setHidden(true)
  }

  if (hidden) {
    return null
  }

  return (
    <div className="flex flex-col gap-0 bg-orange-100 dark:bg-orange-800/33 rounded-2xl">
      <div className="flex flex-row justify-between gap-4 pt-5 px-5 pb-4 bg-orange-200 dark:bg-orange-700/25 rounded-t-2xl">
        <Title className="text-lg md:text-xl font-bold">🤠 Fadderukene er i gang!</Title>

        <Button
          onClick={dismiss}
          variant="text"
          className="-m-1 p-2 hover:bg-orange-100 dark:hover:bg-orange-800 rounded-lg"
        >
          <Icon icon="tabler:x" className="text-xl" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6 pt-4 text-sm md:text-base rounded-b-2xl">
        <Text>De årlige fadderukene er her! Ønsk alle nye velkomne.</Text>

        <Button
          element="a"
          href="https://splash.online.ntnu.no"
          target="_blank"
          rel="noopener noreferrer"
          iconRight={<Icon icon="tabler:arrow-up-right" className="text-base" />}
          className="w-fit bg-indigo-200 hover:bg-indigo-100 dark:bg-stone-700 dark:hover:bg-stone-600"
        >
          Gå til fadderukesiden
        </Button>
      </div>
    </div>
  )
}
