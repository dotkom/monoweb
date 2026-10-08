import type { Metadata } from "next"
import { Text, Title } from "@dotkomonline/ui"
import { server } from "@/utils/trpc/server"
import { ApplicationFlow } from "./ApplicationFlow"

export const metadata: Metadata = {
  title: "Komitéopptak | Online",
}

export default async function ApplicationPage() {
  const applicationPeriod = await server.committeeApplication.findOpenPeriod.query()

  if (applicationPeriod === null || applicationPeriod.groups.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
        <Title element="h1" size="xl">
          Komitéopptak
        </Title>
        <Text>Det er ingen åpne komitéopptak akkurat nå.</Text>
      </div>
    )
  }

  return <ApplicationFlow applicationPeriod={applicationPeriod} />
}
