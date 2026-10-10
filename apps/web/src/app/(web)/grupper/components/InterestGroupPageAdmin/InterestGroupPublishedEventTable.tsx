"use client"

import type { InterestGroupEventSummaryWithRequest } from "@dotkomonline/rpc/interest-group-event"
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "@dotkomonline/ui"
import { createInterestGroupEventPageUrl } from "@dotkomonline/utils"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { LoadMoreSentinel } from "src/components/molecules/LoadMoreSentinel/LoadMoreSentinel"

interface Props {
  events: InterestGroupEventSummaryWithRequest[]
  onSelect: (interestGroupEvent: InterestGroupEventSummaryWithRequest) => void
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isPlaceholderData: boolean
  isLoading: boolean
}

export const InterestGroupPublishedEventTable = ({
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
        <Text className="p-3 text-sm text-muted-foreground">Ingen publiserte arrangementer ennå.</Text>
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
              {events.map((interestGroupEvent) => (
                <TableRow key={interestGroupEvent.id}>
                  <TableCell>{interestGroupEvent.title}</TableCell>
                  <TableCell>{formatDate(interestGroupEvent.start, "dd.MM.yyyy HH:mm")}</TableCell>
                  <TableCell>
                    {interestGroupEvent.registrations.length > 0 ? interestGroupEvent.registrations.length : "-"}
                  </TableCell>
                  <TableCell>
                    {interestGroupEvent.request?.approvedAmount != null
                      ? `${interestGroupEvent.request?.approvedAmount} kr`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onSelect(interestGroupEvent)
                        }}
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
                        href={createInterestGroupEventPageUrl(interestGroupEvent.id, interestGroupEvent.title)}
                      >
                        Se arrangementet
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
