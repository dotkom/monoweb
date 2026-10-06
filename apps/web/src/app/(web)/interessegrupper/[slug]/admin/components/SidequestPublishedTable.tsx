"use client"

import { LoadMoreSentinel } from "@/components/molecules/LoadMoreSentinel/LoadMoreSentinel"
import { getInterestGroupAdminUrl } from "@dotkomonline/rpc/group"
import type { SidequestSummaryWithRequest } from "@dotkomonline/rpc/sidequest"
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "@dotkomonline/ui"
import { createAbsoluteSidequestPageUrl } from "@dotkomonline/utils"
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

export const SidequestPublishedTable = ({
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
        <div className="h-full animate-pulse rounded-md bg-muted" />
      ) : sidequests.length === 0 ? (
        <Text className="p-3 text-sm text-muted-foreground">Ingen publiserte Sidequests ennå.</Text>
      ) : (
        <>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Tittel</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Antall påmeldte</TableHead>
                <TableHead>Godkjent beløp i støtte</TableHead>
                <TableHead />
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sidequests.map((sidequest) => (
                <TableRow key={sidequest.id}>
                  <TableCell>{sidequest.title}</TableCell>
                  <TableCell>{formatDate(sidequest.start, "dd.MM.yyyy HH:mm")}</TableCell>
                  <TableCell>
                    {sidequest.capacity != null
                      ? `${sidequest.registrations.length} / ${sidequest.capacity}`
                      : sidequest.registrations.length}
                  </TableCell>
                  <TableCell>
                    {sidequest.request?.approvedAmount != null ? `${sidequest.request?.approvedAmount} kr` : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        element={Link}
                        href={`${getInterestGroupAdminUrl(interestGroupId)}/soknader/${sidequest.id}`}
                      >
                        Se detaljer
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        element={Link}
                        size="sm"
                        href={createAbsoluteSidequestPageUrl(sidequest.id, sidequest.title)}
                      >
                        Se Sidequest
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
