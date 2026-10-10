"use client"

import type { InterestGroupEventSummaryWithRequest } from "@dotkomonline/rpc/interest-group-event"
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
import { useState } from "react"
import { InterestGroupEventRequestStatusBadge } from "src/app/(admin)/admin/interessegrupper/components/InterestGroupEventRequestStatusBadge"
import { LoadMoreSentinel } from "src/components/molecules/LoadMoreSentinel/LoadMoreSentinel"

interface Props {
  events: InterestGroupEventSummaryWithRequest[]
  onSelect: (event: InterestGroupEventSummaryWithRequest) => void
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isPlaceholderData: boolean
  isLoading: boolean
}

export const InterestGroupEventInReviewTable = ({
  events,
  onSelect,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPlaceholderData,
  isLoading,
}: Props) => {
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)

  return (
    <div ref={setScrollRoot} className="h-80 overflow-y-auto">
      {isLoading && events.length === 0 ? (
        <div className="h-full animate-pulse rounded-md bg-muted" />
      ) : events.length === 0 ? (
        <Text className="p-3 text-sm text-muted-foreground">Ingen søknader ennå.</Text>
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
              {events.map((event) => {
                return (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>
                      <InterestGroupEventRequestStatusBadge status={event.status} />
                    </TableCell>
                    <TableCell>{formatDate(event.createdAt, "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>
                      <div className="flex flex-row justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onSelect(event)
                          }}
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
