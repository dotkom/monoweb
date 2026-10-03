import { server } from "@/utils/trpc/server"
import { createJobListingPageUrl } from "@dotkomonline/utils"
import { notFound, permanentRedirect, RedirectType } from "next/navigation"

interface PageParams {
  slug: string
}

const Page = async ({ params }: { params: Promise<PageParams> }) => {
  const { slug: potentialId } = await params

  const jobListing = await server.jobListing.find.query(decodeURIComponent(potentialId))
  if (!jobListing) {
    return notFound()
  }

  permanentRedirect(createJobListingPageUrl(jobListing.id, jobListing.title), RedirectType.replace)
}

export default Page
