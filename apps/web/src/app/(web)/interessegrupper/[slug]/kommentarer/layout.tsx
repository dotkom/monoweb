import { getServerSession } from "@/auth"
import { server } from "@/utils/trpc/server"
import {
  GroupTypeSchema,
  getGroupDisplayName,
  createGroupPageUrl,
  getInterestGroupCommentsUrl,
} from "@dotkomonline/rpc/group"
import { Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { InterestGroupCommentsPage } from "./InterestGroupCommentsPage"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function InterestGroupCommentsLayout({ params }: Props) {
  const { slug } = await params

  const session = await getServerSession()
  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: getInterestGroupCommentsUrl(slug) }))
  }

  const group = await server.group.find.query(slug)
  if (group === null || group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Link
          href={createGroupPageUrl({ type: "INTEREST_GROUP", slug })}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          {getGroupDisplayName(group)}
        </Link>
        <Title element="h1" className="text-3xl">
          Samtaler
        </Title>
      </div>
      <InterestGroupCommentsPage interestGroup={group} />
    </div>
  )
}
