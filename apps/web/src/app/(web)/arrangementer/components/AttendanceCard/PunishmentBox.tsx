import type { Punishment } from "@dotkomonline/rpc/mark"
import { Button, cn, Text, Title } from "@dotkomonline/ui"
import { IconAlertTriangleFilled, IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"
import type { FC } from "react"

interface PunishmentBoxProps {
  punishment: Punishment
}

export const PunishmentBox: FC<PunishmentBoxProps> = ({ punishment }) => {
  if (punishment.suspended) {
    return (
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-[auto_1fr] gap-2 items-center p-4 rounded-t-lg rounded-b-sm bg-black dark:bg-white text-white dark:text-black">
          <IconAlertTriangleFilled className="shrink-0 size-[1.25em]" />

          <Title element="p" className="text-base">
            Du er suspendert
          </Title>

          <Text className="text-sm col-start-2 col-span-2 text-gray-300 dark:text-stone-700">
            Du er suspendert fra Online, og du kan derfor ikke melde deg på arrangementer.
          </Text>
        </div>

        <Button element={Link} href="/profil" variant="default" color="gray" className="grow rounded-t-sm rounded-b-lg">
          Se detaljer
          <IconArrowUpRight className="shrink-0 size-[1.25em]" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[auto_1fr] gap-2 items-center p-4 rounded-t-lg rounded-b-sm bg-red-100 dark:bg-red-900/25">
        <IconAlertTriangleFilled className="shrink-0 size-[1.25em] text-red-700 dark:text-red-400" />

        <Title element="p" className="text-base">
          {punishment.delay} timers utsatt behandling av påmelding
        </Title>

        <Text className="text-sm font-medium text-pretty col-start-2">
          Du bør fortsatt melde deg på ved påmeldingsstart.
        </Text>

        <Text className="text-sm text-pretty col-start-2 text-gray-600 dark:text-stone-400">
          Påmeldingen din behandles {punishment.delay} timer etter at du melder deg på. Du får plass dersom det er
          ledig. Ellers blir du satt bakerst i køen.
        </Text>
      </div>

      <Button element={Link} href="/profil" variant="default" color="gray" className="grow rounded-t-sm rounded-b-lg">
        Se detaljer
        <IconArrowUpRight className="shrink-0 size-[1.25em]" />
      </Button>
    </div>
  )
}
