"use client"

import { SidequestInReviewTable } from "@/app/interessegrupper/[slug]/admin/components/SidequestInReviewTable"
import { SidequestPublishedTable } from "@/app/interessegrupper/[slug]/admin/components/SidequestPublishedTable"
import { useInterestGroupAdminContext } from "@/app/interessegrupper/[slug]/admin/context"
import { useSidequestsWithReview } from "@/app/interessegrupper/[slug]/admin/queries"
import { createGroupPageUrl, getGroupDisplayName, getInterestGroupAdminUrl } from "@dotkomonline/rpc/group"
import { SidequestStatusSchema } from "@dotkomonline/rpc/sidequest"
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Title } from "@dotkomonline/ui"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

export default function InterestGroupAdminPage() {
  const { group } = useInterestGroupAdminContext()

  const groupName = getGroupDisplayName(group)

  const sidequestsInReviewQuery = useSidequestsWithReview(group.slug, [
    SidequestStatusSchema.enum.IN_REVIEW,
    SidequestStatusSchema.enum.REJECTED,
  ])
  const publishedSidequestsQuery = useSidequestsWithReview(group.slug, [SidequestStatusSchema.enum.PUBLISHED])

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={createGroupPageUrl({ type: "INTEREST_GROUP", slug: group.slug })}
        prefetch={false}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        {groupName}
      </Link>

      <section className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 dark:border-stone-700 sm:flex-row sm:items-center sm:justify-between">
          <Title element="h1" className="text-2xl">
            Administrer interessegruppen
          </Title>
          <div className="flex flex-wrap items-center gap-3">
            <Button element={Link} variant="default" href={`${getInterestGroupAdminUrl(group.slug)}/soknader/ny`}>
              Søk om å arrangere en Sidequest
            </Button>
          </div>
        </div>

        <Tabs defaultValue="requests" className="flex w-full flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="requests">Søknader</TabsTrigger>
            <TabsTrigger value="sidequests">Publiserte Sidequests</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-0">
            <SidequestInReviewTable
              interestGroupId={group.slug}
              sidequests={sidequestsInReviewQuery.sidequestsWithReview}
              fetchNextPage={sidequestsInReviewQuery.fetchNextPage}
              hasNextPage={sidequestsInReviewQuery.hasNextPage}
              isFetchingNextPage={sidequestsInReviewQuery.isFetchingNextPage}
              isPlaceholderData={sidequestsInReviewQuery.isPlaceholderData}
              isLoading={sidequestsInReviewQuery.isLoading}
            />
          </TabsContent>
          <TabsContent value="sidequests" className="mt-0">
            <SidequestPublishedTable
              interestGroupId={group.slug}
              sidequests={publishedSidequestsQuery.sidequestsWithReview}
              fetchNextPage={publishedSidequestsQuery.fetchNextPage}
              hasNextPage={publishedSidequestsQuery.hasNextPage}
              isFetchingNextPage={publishedSidequestsQuery.isFetchingNextPage}
              isPlaceholderData={publishedSidequestsQuery.isPlaceholderData}
              isLoading={publishedSidequestsQuery.isLoading}
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
