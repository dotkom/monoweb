import { cookies } from "next/headers"
import { CareerListPage } from "./CareerListPage"
import { JOB_LISTING_VIEW_COOKIE_NAME, parseJobListingViewMode } from "./hooks/jobListingViewCookie"

const CareerPage = async () => {
  const cookieStore = await cookies()
  const initialViewMode = parseJobListingViewMode(cookieStore.get(JOB_LISTING_VIEW_COOKIE_NAME)?.value)

  return <CareerListPage initialViewMode={initialViewMode} />
}

export default CareerPage
