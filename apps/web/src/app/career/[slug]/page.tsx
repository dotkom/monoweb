import { fetchCareerAd } from "@/api/get-career-ads"
import { CareerAdView } from "@/components/views/CareerAdView"

interface CareerProps {
  params: {
    slug: string
  }
}

const CareerAdPage = async ({ params: { slug } }: CareerProps) => {
  const careerData = await fetchCareerAd(slug)
  if (!careerData) {
    return <div>404 - Sanity not found</div>
  }
  return <CareerAdView career={careerData} />
}

export default CareerAdPage
