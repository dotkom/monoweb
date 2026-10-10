"use client"

import { useIsMobile } from "@/app/(admin)/admin/hooks/use-is-mobile"
import { LocationBox } from "@/app/arrangementer/components/TimeLocationBox/LocationBox"
import { TimeBox } from "@/app/arrangementer/components/TimeLocationBox/TimeBox"
import { GroupLogo } from "@/components/atoms/GroupLogo"
import { Link } from "@/components/link"
import { createGroupPageUrl, getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  isUserRegisteredForInterestGroupEvent,
  type InterestGroupEventSummary,
} from "@dotkomonline/rpc/interest-group-event"
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  RichText,
  Text,
} from "@dotkomonline/ui"
import { IconArrowRight, IconX } from "@tabler/icons-react"
import { isPast } from "date-fns"
import { InterestGroupEventJoinButton } from "./InterestGroupEventJoinButton"
import { InterestGroupEventRegistrations } from "./InterestGroupEventRegistrations"

interface InterestGroupEventDrawerProps {
  interestGroupEvent: InterestGroupEventSummary | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onCloseComplete?: () => void
  userId: string | null
  isLoggedIn: boolean
  isRegistrationPending?: boolean
  onRegistrationClick: () => void
}

export const InterestGroupEventDrawer = ({
  interestGroupEvent,
  isOpen,
  onOpenChange,
  onCloseComplete,
  userId,
  isLoggedIn,
  isRegistrationPending = false,
  onRegistrationClick,
}: InterestGroupEventDrawerProps) => {
  const isMobile = useIsMobile()
  const groupName = interestGroupEvent !== null ? getGroupDisplayName(interestGroupEvent.interestGroup) : ""
  const isUserRegisteredForEvent =
    interestGroupEvent !== null && userId !== null && isUserRegisteredForInterestGroupEvent(userId, interestGroupEvent)
  const eventHasEnded = interestGroupEvent !== null && isPast(interestGroupEvent.end)

  return (
    <Drawer
      open={isOpen}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(open) => {
        if (!open) {
          onCloseComplete?.()
        }
      }}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="flex h-full min-h-0 flex-col overflow-hidden md:max-w-xl!" showOverlay={false}>
        {interestGroupEvent === null ? (
          <DrawerTitle className="sr-only">Arrangement</DrawerTitle>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 flex flex-col gap-5">
              <div className="relative">
                {
                  // biome-ignore lint/performance/noImgElement: unoptimized next/image crashes iOS Safari (#3062)
                } <img
                  src={interestGroupEvent.imageUrl}
                  alt={interestGroupEvent.title}
                  className="aspect-video w-full rounded-xl object-cover bg-gray-100 dark:bg-stone-800"
                />
                <DrawerClose
                  render={
                    <Button
                      variant="unstyled"
                      aria-label="Lukk"
                      className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    />
                  }
                >
                  <IconX className="size-5" />
                </DrawerClose>
              </div>

              <div className="flex flex-col gap-2">
                <DrawerTitle className="text-xl font-semibold leading-snug">{interestGroupEvent.title}</DrawerTitle>
                <DrawerDescription className="sr-only">{groupName}</DrawerDescription>
                <Link
                  href={createGroupPageUrl(interestGroupEvent.interestGroup)}
                  className="flex min-w-0 items-center gap-2 text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-2 w-fit"
                >
                  <GroupLogo
                    src={interestGroupEvent.interestGroup.imageUrl}
                    alt={groupName}
                    height={20}
                    width={20}
                    containerClassName="size-5 rounded-full"
                  />
                  <Text size="sm" truncate className="min-w-0">
                    {groupName}
                  </Text>
                  <IconArrowRight className="size-3.5 shrink-0" />
                </Link>
              </div>

              <div className="flex min-w-0 flex-wrap">
                <div className="min-w-56 flex-1">
                  <TimeBox event={interestGroupEvent} />
                </div>
                <div className="min-w-56 flex-1">
                  <LocationBox event={interestGroupEvent} />
                </div>
              </div>

              <InterestGroupEventRegistrations
                variant="box"
                registrations={interestGroupEvent.registrations}
                eventHasEnded={eventHasEnded}
                userId={userId}
              />

              {!isMobile && (
                <InterestGroupEventJoinButton
                  isLoggedIn={isLoggedIn}
                  isUserRegistered={isUserRegisteredForEvent}
                  isPending={isRegistrationPending}
                  onRegistrationClick={onRegistrationClick}
                  eventHasEnded={eventHasEnded}
                  className="w-full"
                />
              )}

              <section className="flex flex-col gap-2">
                <Text size="sm" className="text-muted-foreground">
                  Om arrangementet
                </Text>
                <RichText content={interestGroupEvent.description} className="max-w-full prose-img:max-w-full" />
              </section>
            </div>
            {isMobile && (
              <DrawerFooter className="shrink-0 border-t border-border">
                <InterestGroupEventJoinButton
                  isLoggedIn={isLoggedIn}
                  isUserRegistered={isUserRegisteredForEvent}
                  isPending={isRegistrationPending}
                  onRegistrationClick={onRegistrationClick}
                  eventHasEnded={eventHasEnded}
                  className="w-full"
                />
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
