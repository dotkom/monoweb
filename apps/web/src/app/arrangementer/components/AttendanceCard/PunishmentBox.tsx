import type { Punishment } from "@dotkomonline/types"
import { Button, Icon, Text } from "@dotkomonline/ui"
import type { FC } from "react"

interface PunishmentBoxProps {
  punishment: Punishment
}

export const PunishmentBox: FC<PunishmentBoxProps> = ({ punishment }) => {
  if (punishment.suspended) {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm">
        <div className="flex flex-row gap-2 items-center">
          <Icon icon="tabler:alert-triangle" className="text-lg" />
          <Text className="text-base">Du er suspendert</Text>
        </div>

        <Text>
          Gå til{" "}
          <Button
            element="a"
            href="/profil"
            variant="text"
            color="dark"
            className="-mx-0.5 -my-1 text-sm text-white dark:text-black"
            iconRight={<Icon icon="tabler:arrow-up-right" />}
          >
            profilen din
          </Button>{" "}
          for å se detaljer.
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-red-200 dark:bg-red-900 text-sm">
      <div className="flex flex-row gap-2 items-center">
        <Icon icon="tabler:alert-triangle" className="text-lg" />
        <Text className="text-base">Du har {punishment.delay} timer utsatt påmelding</Text>
      </div>

      <Text>
        Du <strong>kan fortsatt melde deg på</strong> ved påmeldingsstart,
        <br />
        men du vil være i venteliste til utsettelsen er over.
      </Text>

      <Text>
        Gå til{" "}
        <Button
          element="a"
          href="/profil"
          variant="text"
          color="red"
          className="-mx-0.5 -my-1 text-sm hover:bg-red-100 dark:hover:bg-red-950/50"
          iconRight={<Icon icon="tabler:arrow-up-right" />}
        >
          profilen din
        </Button>{" "}
        for å se detaljer.
      </Text>
    </div>
  )
}
