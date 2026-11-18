import { getServerSession } from "@/auth"
import { getInterestGroupCommentsUrl } from "@dotkomonline/rpc/group"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function InterestGroupCommentsPage({ params }: Props) {
  const { slug } = await params
  const session = await getServerSession()

  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: getInterestGroupCommentsUrl(slug) }))
  }

  return null
}
