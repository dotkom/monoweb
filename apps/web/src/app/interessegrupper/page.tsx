import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Button, Text, Title } from "@dotkomonline/ui"
import Link from "next/link"

export default async function InterestPage() {
  const interestGroups = await server.interestGroup.all.query()

  return (
    <div>
      <div className="border-slate-7 border-b">
        <div className="flex flex-col py-5">
          <Title element="h1" className="mt-4 text-3xl">
            Interessegrupper
          </Title>
          <Text className="pt-2">
            På denne siden finner du informasjon om alle de forskjellige interessegruppene i Online. Ser du noe som ser
            interessant ut? Ta kontakt og møt noen med samme interesser som deg. Interessegruppene i Online er grupper
            for alle mulige slags interesser. Har du og en kompis eller to en sær/stilig/fantastisk interesse? Opprett
            en interessegruppe!
          </Text>
          <Text className="text-slate-11 pt-2">
            Mer informasjon om hvordan dette gjøres finnes{" "}
            <Link
              className="hover:underline text-blue-8"
              href={"https://wiki.online.ntnu.no/info/innsikt-og-interface/interessegrupper/"}
            >
              her.
            </Link>
          </Text>
        </div>
      </div>

      <div>
        <Link
          href={"https://docs.google.com/forms/d/e/1FAIpQLSebaBslZ3nmh2wubQ_mPJYYU2XNIRlJZ1BooFuH7y6wxylaWA/viewform"}
        >
          <Button className="mr-4 mt-4">Opprett interessegruppe</Button>
        </Link>
        <Link
          href={
            "https://docs.google.com/forms/d/e/1FAIpQLScr27q7C4gDvzHXajydznfFxPs7JaGpgYrNX4RPiVRvUHXVGg/viewform?pli=1"
          }
        >
          <Button className="mr-4 mt-4">Søk om støtte</Button>
        </Link>
      </div>
      <div className="mt-8">
        <GroupList groups={interestGroups} baseLink="interessegrupper" />
      </div>
    </div>
  )
}
