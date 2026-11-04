import { server } from "@/utils/trpc/server"

import { createEventPageUrl } from "@dotkomonline/utils"
import { notFound, permanentRedirect, RedirectType } from "next/navigation"

interface PageParams {
  slug: string
}

const Page = async ({ params }: { params: Promise<PageParams> }) => {
  const { slug: potentialId } = await params

  const eventDetail = await server.event.find.query(decodeURIComponent(potentialId))
  if (eventDetail === null) {
    return notFound()
  }

  permanentRedirect(createEventPageUrl(eventDetail.event.id, eventDetail.event.title), RedirectType.replace)
}

export default Page
