import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Button, Icon, Text, Title } from "@dotkomonline/ui"
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
        <Button
          variant="text"
          element={Link}
          href={"https://wiki.online.ntnu.no/info/innsikt-og-interface/interessegrupper/"}
          iconRight={<Icon icon="tabler:arrow-up-right" />}
          className="w-fit"
        >
          Mer informasjon om hvordan dette gjøres finnes her
        </Button>
      </div>

      <div className="flex flex-row gap-4">
        <Button
          color="brand"
          element={Link}
          href={"https://docs.google.com/forms/d/e/1FAIpQLSebaBslZ3nmh2wubQ_mPJYYU2XNIRlJZ1BooFuH7y6wxylaWA/viewform"}
          icon={<Icon icon="tabler:users-plus" className="text-lg" />}
        >
          Opprett interessegruppe
        </Button>

        <Button
          element={Link}
          href={
            "https://docs.google.com/forms/d/e/1FAIpQLScr27q7C4gDvzHXajydznfFxPs7JaGpgYrNX4RPiVRvUHXVGg/viewform?pli=1"
          }
          icon={<Icon icon="tabler:coins" className="text-lg" />}
        >
          Søk om støtte
        </Button>
      </div>

      <GroupList groups={interestGroups} />
    </div>
  )
}
