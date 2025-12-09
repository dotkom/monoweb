import { createGroupPageUrl } from "@dotkomonline/types"
import { richTextToPlainText } from "@dotkomonline/utils"
import type { Metadata } from "next"
import { GroupPage } from "@/app/grupper/components/GroupPage"
import { server } from "@/utils/trpc/server"

interface InterestGroupPageProps {
  params: Promise<{ slug: string }>
}

const InterestGroupPage = ({ params }: InterestGroupPageProps) => {
  return <GroupPage params={params} />
}

export async function generateMetadata({ params }: Pick<InterestGroupPageProps, "params">): Promise<Metadata> {
  const { slug } = await params

  const group = await server.group.find.query(slug)

  if (!group) {
    return {
      title: "Gruppe ikke funnet | Linjeforeningen Online",
      description: "Gruppen finnes ikke eller er slettet.",
    }
  }

  const name = group.name || group.abbreviation
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

export default InterestGroupPage
