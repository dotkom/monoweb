import { getServerSession } from "@/auth"
import { server } from "@/utils/trpc/server"
import { createGroupPageUrl, getGroupDisplayName, GroupTypeSchema } from "@dotkomonline/rpc/group"
import { richTextToPlainText } from "@dotkomonline/utils"
import type { Metadata } from "next"
import notFound from "../../not-found"
import { InterestGroupPage } from "../components/InterestGroupPage"

interface InterestGroupPageProps {
  params: Promise<{ slug: string }>
}

const Page = async ({ params }: InterestGroupPageProps) => {
  const { slug } = await params
  const group = await server.group.find.query(slug)

  if (group == null || group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
    return notFound()
  }

  const [session, members, comments] = await Promise.all([
    getServerSession(),
    server.group.getMembers.query(slug),
    server.group.findManyInterestGroupComments.query(slug),
  ])

  return (
    <InterestGroupPage
      interestGroup={group}
      userId={session?.sub}
      initialMembers={members}
      initialComments={comments}
    />
  )
}

export async function generateMetadata({ params }: Pick<InterestGroupPageProps, "params">): Promise<Metadata> {
  const { slug } = await params

  const group = await server.group.find.query(slug)

  if (group == null || group.type === GroupTypeSchema.enum.EMAIL_ONLY) {
    return {
      title: "Interessegruppen ikke funnet | Linjeforeningen Online",
      description: "Interessegruppen finnes ikke eller er slettet.",
    }
  }

  const name = getGroupDisplayName(group)
  const description = richTextToPlainText(group.shortDescription || group.description)
  const groupPageUrl = createGroupPageUrl(group)

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      url: groupPageUrl,
      siteName: "Linjeforeningen Online",
      images: group.imageUrl
        ? [
            {
              url: group.imageUrl,
              alt: `Logo for ${name}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: group.imageUrl ? [group.imageUrl] : undefined,
    },
  }
}

export default Page
