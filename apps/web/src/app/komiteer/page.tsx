import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Text, Title } from "@dotkomonline/ui"

const CommitteePage = async () => {
  const allCommittees = await server.group.allByType.query("COMMITTEE")

  const activeCommittees = allCommittees.filter((committee) => !committee.deactivatedAt)
  const inactiveCommittees = allCommittees.filter((committee) => committee.deactivatedAt)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Title element="h1" className="text-3xl">
          Velkommen til Onlines komiteer!
        </Title>

        <Text>
          Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en flott
          studiehverdag.
        </Text>
      </div>

      <GroupList groups={activeCommittees} />
    </div>
  )
}

export default CommitteePage
