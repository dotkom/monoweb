import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Text, Title } from "@dotkomonline/ui"
import Link from "next/link"

export default async function NodeCommitteePage() {
  const nodeCommittees = await server.group.allByType.query("NODE_COMMITTEE")

  return (
    <div>
      <div className="border-gray-600 border-b">
        <div className="flex flex-col pb-5">
          <Title element="h1" className="text-3xl">
            Nodekomiteer
          </Title>
          <Text className="pt-2">
            På denne siden finner du informasjon om alle de forskjellige nodekomiteene i Online.
          </Text>
          <Text className="pt-2">
            En nodekomite er periodebaserte underkomiteer av kjernekomiteene i Online. Dette vil si at nodekomiteene og
            deres medlemmer bare er aktive under visse perioder, og ikke kontinuerlig slik som kjernekomiteene.
            Hovedoppgaven til nodekomiteene er å organisere og gjennomføre sentrale hendelser i linjeforeningen Online.
          </Text>
          <Text className="text-gray-950 pt-2">
            Mer informasjon finnes{" "}
            <Link
              className="hover:underline text-blue-700"
              href={"https://wiki.online.ntnu.no/info/innsikt-og-interface/nodekomiteer/"}
            >
              her.
            </Link>
          </Text>
        </div>
      </div>
      <div className="mt-8">
        <GroupList groups={nodeCommittees} baseLink="nodekomiteer" />
      </div>
    </div>
  )
}
