"use client"

import type { FC } from "react"
import { useSearchParams } from "next/navigation"
import { Title, Text, Button } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconLogin2 } from "@tabler/icons-react"

export const AuthNotice: FC = () => {
  const search = useSearchParams()
  const error = search.get("error")
  if (error === null) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 bg-red-300 rounded-lg p-4">
      <div className="flex flex-col gap-0.5">
        <Title className="text-sm md:text-base font-bold">Feil oppsto under innlogging!</Title>
        <div className="flex flex-row justify-between gap-1.5 items-center">
          <Text>Detaljer: {error}</Text>
          <Button element="a" color="brand" href={createAuthorizeUrl()} size="lg">
            Logg inn
            <IconLogin2 className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
