import { getServerSession } from "@/auth"
import { getInterestGroupCommentsUrl } from "@dotkomonline/rpc/group"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string; commentId: string }>
}

export default async function InterestGroupCommentThreadPage({ params }: Props) {
  const { slug, commentId } = await params
  const session = await getServerSession()

  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: getInterestGroupCommentsUrl(slug, commentId) }))
  }

  return null
}
