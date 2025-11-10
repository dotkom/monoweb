import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Button, Text, Title } from "@dotkomonline/ui"
import { IconCoins, IconUsersPlus } from "@tabler/icons-react"
import Link from "next/link"

export default async function InterestGroupPage() {
  const interestGroups = await server.group.allByType.query("INTEREST_GROUP")

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Title element="h1" className="text-3xl">
          Interessegrupper
        </Title>
        <Text>
          På denne siden finner du informasjon om alle de forskjellige interessegruppene i Online. Ser du noe som ser
          interessant ut? Ta kontakt og møt noen med samme interesser som deg. Interessegruppene i Online er grupper for
          alle mulige slags interesser. Har du og en kompis eller to en sær/stilig/fantastisk interesse? Opprett en
          interessegruppe!
        </Text>
      </div>

      <div className="flex flex-row gap-4">
        <Button
          color="brand"
          element={Link}
          href="https://docs.google.com/forms/d/e/1FAIpQLSebaBslZ3nmh2wubQ_mPJYYU2XNIRlJZ1BooFuH7y6wxylaWA/viewform"
          icon={<IconUsersPlus className="size-5" />}
        >
          Opprett eller overta interessegruppe
        </Button>

        <Button
          element={Link}
          href="https://docs.google.com/forms/d/e/1FAIpQLScr27q7C4gDvzHXajydznfFxPs7JaGpgYrNX4RPiVRvUHXVGg/viewform?pli=1"
          icon={<IconCoins className="size-5" />}
        >
          Søk om støtte
        </Button>
      </div>

      <GroupList groups={interestGroups} />
    </div>
  )
}
