import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Text, Title } from "@dotkomonline/ui"

export default async function OtherGroupsPage() {
  const otherGroups = await server.group.allByType.query("OTHERGROUP")

  return (
    <div>
      <div className="border-slate-600 border-b">
        <div className="flex flex-col pb-5">
          <Title element="h1" className="text-3xl">
            Grupper tilknyttet Online
          </Title>
          <Text className="pt-2">
            På denne siden finner du informasjon om gruppene under Online, som verken er interessegrupper eller
            komiteer.
          </Text>
        </div>
      </div>

      <div className="mt-8">
        <GroupList groups={otherGroups} baseLink="andre-grupper" />
      </div>
    </div>
  )
}
