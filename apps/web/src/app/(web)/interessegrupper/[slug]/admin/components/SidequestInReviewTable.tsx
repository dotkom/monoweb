"use client"

import { SidequestRequestStatusBadge } from "@/app/(admin)/admin/sidequests/components/SidequestRequestStatusBadge"
import { LoadMoreSentinel } from "@/components/molecules/LoadMoreSentinel/LoadMoreSentinel"
import { getInterestGroupAdminUrl } from "@dotkomonline/rpc/group"
import type { SidequestSummaryWithRequest } from "@dotkomonline/rpc/sidequest"
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "@dotkomonline/ui"
import { IconFileText } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useState } from "react"

interface Props {
  interestGroupId: string
  sidequests: SidequestSummaryWithRequest[]
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isPlaceholderData: boolean
  isLoading: boolean
}

export const SidequestInReviewTable = ({
  interestGroupId,
  sidequests,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPlaceholderData,
  isLoading,
}: Props) => {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)

  return (
    <div
      ref={setScrollRoot}
      className="min-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-stone-700 dark:bg-stone-900"
    >
      {isLoading && sidequests.length === 0 ? (
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
      ) : sidequests.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-muted-foreground dark:bg-stone-800">
            <IconFileText className="size-5" />
          </span>
          <div className="flex max-w-sm flex-col gap-1">
            <Text className="font-medium">Ingen søknader ennå</Text>
            <Text className="text-sm text-muted-foreground">
              Har dere en idé til en aktivitet? Søk om støtte fra Online.
            </Text>
          </div>
          <Button element={Link} variant="default" href={`${getInterestGroupAdminUrl(interestGroupId)}/soknader/ny`}>
            Søk om å arrangere en Sidequest
          </Button>
        </div>
      ) : (
        <>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Tittel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opprettet</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sidequests.map((sidequest) => {
                return (
                  <TableRow key={sidequest.id}>
                    <TableCell>{sidequest.title}</TableCell>
                    <TableCell>
                      <SidequestRequestStatusBadge status={sidequest.status} />
                    </TableCell>
                    <TableCell>{formatDate(sidequest.createdAt, "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>
                      <div className="flex flex-row justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          element={Link}
                          href={`${getInterestGroupAdminUrl(interestGroupId)}/soknader/${sidequest.id}`}
                        >
                          Se søknad
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <LoadMoreSentinel
            root={scrollRoot}
            rootMargin="80px 0px"
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isPlaceholderData={isPlaceholderData}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  )
}
