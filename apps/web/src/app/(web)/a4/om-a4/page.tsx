import { Text, Title } from "@dotkomonline/ui"
import { KontoretMap } from "../components/A4Map"
import { getKontoretRooms, CAMPUS_ID, MAP_ZOOM } from "./rooms"

const OfficePage = async () => {
  const rooms = await getKontoretRooms()

  return (
    <div className="flex flex-col gap-2">
      <Title element="h1" size="xl">
        Om A4
      </Title>

      <Text className="text-gray-600 dark:text-stone-300">
        Som Onliner er det flere nyttige rom på A4. Bruk knappene for å se hvor de er.
      </Text>

      {rooms.length > 0 && <KontoretMap rooms={rooms} campusId={CAMPUS_ID} zoom={MAP_ZOOM} className="mt-2" />}
    </div>
  )
}

export default OfficePage
