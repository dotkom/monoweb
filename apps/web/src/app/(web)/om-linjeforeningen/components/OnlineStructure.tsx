import { server } from "@/utils/trpc/server"

export const OnlineStructureFlow = () => {
  const groups = server.group.all.query()
  console.log(groups)
  return <div className="h-125"></div>
}
