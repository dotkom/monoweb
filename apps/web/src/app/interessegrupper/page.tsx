import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Button, Text, Title } from "@dotkomonline/ui"
import Link from "next/link"

export default async function InterestGroupPage() {
  const interestGroups = await server.group.allByType.query("INTEREST_GROUP")

  return (
    <div>
      <div className="border-gray-600 border-b">
        <div className="flex flex-col pb-5">
          <Title element="h1" className="text-3xl">
            Interessegrupper
          </Title>
          <Text className="pt-2">
            På denne siden finner du informasjon om alle de forskjellige interessegruppene i Online. Ser du noe som ser
            interessant ut? Ta kontakt og møt noen med samme interesser som deg. Interessegruppene i Online er grupper
            for alle mulige slags interesser. Har du og en kompis eller to en sær/stilig/fantastisk interesse? Opprett
            en interessegruppe!
          </Text>
          <Text className="text-gray-950 pt-2">
            Mer informasjon om hvordan dette gjøres finnes{" "}
            <Link
              className="hover:underline text-blue-700"
              href={"https://wiki.online.ntnu.no/info/innsikt-og-interface/interessegrupper/"}
            >
              her.
            </Link>
          </Text>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href={"https://docs.google.com/forms/d/e/1FAIpQLSebaBslZ3nmh2wubQ_mPJYYU2XNIRlJZ1BooFuH7y6wxylaWA/viewform"}
          className="mr-4"
        >
          <Button>Opprett interessegruppe</Button>
        </Link>
        <Link
          href={
            "https://docs.google.com/forms/d/e/1FAIpQLScr27q7C4gDvzHXajydznfFxPs7JaGpgYrNX4RPiVRvUHXVGg/viewform?pli=1"
          }
        >
          <Button>Søk om støtte</Button>
        </Link>
      </div>
      <div className="mt-8">
        <GroupList groups={interestGroups} />
      </div>
    </div>
  )
}
