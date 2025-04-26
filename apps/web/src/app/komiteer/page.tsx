import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"

const CommitteePage = async () => {
  const committees = await server.group.allByType.query("COMMITTEE")

  return (
    <div>
      <div className="border-slate-7 border-b">
        <div className="flex flex-col py-5">
          <p className="mt-4 text-3xl font-bold border-b-0">Velkommen til Onlines komiteer!</p>
          <p className="text-slate-11 pt-2">
            Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en
            flott studiehverdag.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <GroupList groups={committees} baseLink="komiteer" />
      </div>
    </div>
  )
}

export default CommitteePage
