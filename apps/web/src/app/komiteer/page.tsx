import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Text, Title } from "@dotkomonline/ui"

const CommitteePage = async () => {
  const committees = await server.group.allByType.query("COMMITTEE")

  return (
    <div>
      <div className="border-slate-600 border-b">
        <div className="flex flex-col pb-5">
          <Title element="h1" className="text-3xl">
            Velkommen til Onlines komiteer!
          </Title>
          <Text className="pt-2">
            Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en
            flott studiehverdag.
          </Text>
        </div>
      </div>

      <div className="mt-8">
        <GroupList groups={committees} baseLink="komiteer" />
      </div>
    </div>
  )
}

export default CommitteePage
