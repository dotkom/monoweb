import { Text } from "@dotkomonline/ui"
import { server } from "@utils/trpc/server"

export default async function minSide() {
  const offline = await server.offline.all.query()
  const offlineCount = offlines.length
  const firstOffline = offlines[0]

  return (
    <div>
      <Text>hei</Text>
      <Text>Antall artikler: {offlineCount}</Text>
      <Text>første på offline: {firstOffline.title}</Text>
      <image src={newestOffline.imageUrl ?? ""} alt={newestOffline.title} width={100} height={100} />
    </div>
  )
}
