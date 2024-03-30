import { fetchCareerAds } from "@/api/get-career-ads"
import CareerView from "@/components/views/CareerView"

const Career = async () => {
  const careersData = await fetchCareerAds()
  return <CareerView careers={careersData} />
}

export default Career
