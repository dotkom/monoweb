import CareerView from "@/components/views/CareerView"
import { trpc } from "@/utils/trpc"

const CareerPage = () => {
  const { data, isLoading } = trpc.jobListing.all.useQuery()
  if (isLoading) {
    return <p>Loading...</p>
  }
  return <CareerView careers={data ?? []} />
}
export default CareerPage
