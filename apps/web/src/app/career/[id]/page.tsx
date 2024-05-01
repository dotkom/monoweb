import { CareerAdView } from "@/components/views/CareerAdView"
import { getServerClient } from "@/utils/trpc/serverClient"

interface CareerProps {
  params: {
    id: string
  }
}

const CareerAdPage = async ({ params: { id } }: CareerProps) => {
  const serverClient = await getServerClient()
  const data = await serverClient.jobListing.get(id)
  if (!data) {
    return <div>404 - not find</div>
  }
  return <CareerAdView career={data} />
}

export default CareerAdPage
