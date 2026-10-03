import type { Punishment } from "@dotkomonline/rpc/mark"
import { cn, Text, Title } from "@dotkomonline/ui"
import { IconAlertTriangleFilled, IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"
import type { FC } from "react"

interface PunishmentBoxProps {
  punishment: Punishment
}

export const PunishmentBox: FC<PunishmentBoxProps> = ({ punishment }) => {
  if (punishment.suspended) {
    return (
      <Link
        href="/profil"
        className={cn(
          "grid grid-cols-[auto_1fr_auto] gap-2 items-center p-4 rounded-lg transition-colors",
          "bg-black hover:bg-neutral-700 dark:bg-white dark:hover:bg-neutral-300 text-white dark:text-black"
        )}
      >
        <IconAlertTriangleFilled className="shrink-0 size-[1.25em]" />

        <Title element="p" className="text-base">
          Du er suspendert
        </Title>

        <IconArrowUpRight className="shrink-0 size-[1.25em]" />

        <Text className="text-sm col-start-2 col-span-2 text-gray-300 dark:text-stone-700">
          Du er suspendert fra Online, og du kan derfor ikke melde deg på arrangementer.
        </Text>

        <Text className="text-sm col-start-2 col-span-2 text-gray-300 dark:text-stone-700">
          Gå til profilen din for å se detaljer.
        </Text>
      </Link>
    )
  }

  return (
    <Link
      href="/profil"
      className={cn(
        "grid grid-cols-[auto_1fr_auto] gap-2 items-center p-4 rounded-lg transition-colors",
        "bg-red-100 hover:bg-red-100/66 dark:bg-red-900/25 dark:hover:bg-red-800/25"
      )}
    >
      <IconAlertTriangleFilled className="shrink-0 size-[1.25em] text-red-700 dark:text-red-400" />

      <Title element="p" className="text-base">
        {punishment.delay} timer utsatt påmelding pga. prikk
      </Title>

      <IconArrowUpRight className="shrink-0 size-[1.25em]" />

      <Text className="text-sm text-pretty col-start-2 col-span-2 text-gray-600 dark:text-stone-400">
        Du{" "}
        <Text element="span" className="text-black dark:text-white">
          kan fortsatt melde deg på
        </Text>{" "}
        ved påmeldingsstart, men du vil være i venteliste til utsettelsen er over.
      </Text>

      <Text className="text-sm col-start-2 col-span-2 text-gray-600 dark:text-stone-400">
        Gå til profilen din for å se detaljer.
      </Text>
    </Link>
  )
}
