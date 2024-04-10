import { InterestGroupCard } from "@/components/molecules/InterestGroupCard"
import { getServerClient } from "@/utils/trpc/serverClient"

export default async function InterestGroupPage() {
  const serverClient = await getServerClient()
  const interestGroups = await serverClient.interestGroup.all()

  interestGroups.data.sort((a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1))

  return (
    <div className="mt-8 mb-16 mx-auto flex flex-col w-full min-[1240px]:w-11/12">
      <h1 className="text-4xl font-bold w-fit mx-auto xl:mx-0">Interessegrupper</h1>
      <ul className="mt-8 gap-y-10 gap-x-6 flex flex-wrap justify-center xl:justify-between">
        {interestGroups.data.map((interestGroup) => (
          <li key={interestGroup.id}>
            <InterestGroupCard data={interestGroup} />
          </li>
        ))}
      </ul>
    </div>
  )
}
