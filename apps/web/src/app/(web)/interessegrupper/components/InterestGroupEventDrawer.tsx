"use client"

import { useIsMobile } from "@/app/(admin)/admin/hooks/use-is-mobile"
import { LocationBox } from "@/app/arrangementer/components/TimeLocationBox/LocationBox"
import { TimeBox } from "@/app/arrangementer/components/TimeLocationBox/TimeBox"
import { GroupLogo } from "@/components/atoms/GroupLogo"
import { Link } from "@/components/link"
import { env } from "@/env"
import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import { createGroupPageUrl, getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  getInterestGroupEventUserRegistrationState,
  isInterestGroupEventEnded,
  type InterestGroupEventSummary,
} from "@dotkomonline/rpc/interest-group-event"
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  RichText,
  Text,
  Tilt,
  Title,
  cn,
} from "@dotkomonline/ui"
import { createAbsoluteInterestGroupEventPageUrl } from "@dotkomonline/utils"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { IconCheck, IconChevronsRight, IconCopy, IconX } from "@tabler/icons-react"
import { InterestGroupEventJoinButton } from "./InterestGroupEventJoinButton"
import { InterestGroupEventRegistrationDateInfo } from "./InterestGroupEventRegistrationDateInfo"
import { InterestGroupEventRegistrations } from "./InterestGroupEventRegistrations"
import { PlaceHolderImage } from "src/components/atoms/PlaceHolderImage"

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
  const { icon, copy } = useCopyToClipboard()
  const groupName = interestGroupEvent !== null ? getGroupDisplayName(interestGroupEvent.interestGroup) : ""
  const registrationState =
    interestGroupEvent !== null ? getInterestGroupEventUserRegistrationState(userId, interestGroupEvent) : null
  const eventHasEnded = interestGroupEvent !== null && isInterestGroupEventEnded(interestGroupEvent)

  const joinButton = interestGroupEvent !== null && registrationState !== null && (
    <InterestGroupEventJoinButton
      isLoggedIn={isLoggedIn}
      isUserRegistered={registrationState.isUserRegistered}
      isUserOnWaitlist={registrationState.isUserOnWaitlist}
      waitlistPosition={registrationState.waitlistPosition}
      isAtCapacity={registrationState.isAtCapacity}
      isPending={isRegistrationPending}
      onRegistrationClick={onRegistrationClick}
      eventHasEnded={eventHasEnded}
      registerEnd={interestGroupEvent.registerEnd}
      deregisterDeadline={interestGroupEvent.deregisterDeadline}
      variant="default"
      className="w-full"
    />
  )

  return (
    <Drawer
      swipeDirection={isMobile ? "down" : "right"}
      open={isOpen}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(open) => {
        if (!open) {
          onCloseComplete?.()
        }
      }}
    >
      <DrawerContent
        aria-describedby={undefined}
        showOverlay={isOpen}
        style={isOpen ? undefined : { pointerEvents: "none" }}
        overlayClassName="bg-black/20 dark:bg-black/50 supports-backdrop-filter:backdrop-blur-none"
        handleClassName="hidden group-data-[swipe-direction=down]/drawer-content:hidden"
        className={cn(
          "overflow-hidden",
          "data-[swipe-direction=down]:mt-8 data-[swipe-direction=down]:h-[calc(100dvh-2rem)] data-[swipe-direction=down]:max-h-[calc(100dvh-2rem)]",
          !isMobile &&
            cn(
              "border border-field-border shadow-xl [--drawer-inset:1rem]",
              "data-[swipe-direction=right]:inset-y-4",
              "data-[swipe-direction=right]:right-4",
              "data-[swipe-direction=right]:rounded-xl",
              "data-[swipe-direction=right]:w-[min(--spacing(152),60vw)]",
              "data-[swipe-direction=right]:sm:max-w-none"
            )
        )}
      >
        <DrawerHeader className="shrink-0 border-b border-field-border group-data-[swipe-direction=down]/drawer-content:text-left">
          <DrawerTitle className="sr-only">{interestGroupEvent?.title ?? "Arrangement"}</DrawerTitle>

          <div className="flex flex-row items-center gap-5">
            {!isMobile && (
              <DrawerClose render={<Button variant="ghost" size="icon" aria-label="Lukk arrangement" />}>
                <IconChevronsRight className="size-5" />
              </DrawerClose>
            )}

            {interestGroupEvent !== null && (
              <Button
                onClick={() => {
                  const eventUrl = createAbsoluteInterestGroupEventPageUrl(
                    env.NEXT_PUBLIC_ORIGIN,
                    interestGroupEvent.id,
                    interestGroupEvent.title
                  )

                  void copy(eventUrl)
                }}
              >
                {icon === "check" ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
                Kopier lenke
              </Button>
            )}

            {isMobile && (
              <div className="ml-auto">
                <DrawerClose render={<Button variant="ghost" size="icon" aria-label="Lukk" />}>
                  <IconX className="size-5" />
                </DrawerClose>
              </div>
            )}
          </div>
        </DrawerHeader>

        <ScrollArea.Root
          key={interestGroupEvent?.id}
          data-base-ui-swipe-ignore
          type="auto"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <ScrollArea.Viewport className="h-full w-full overscroll-contain">
            <div className="p-4">
              {interestGroupEvent !== null && (
                <div className="flex flex-col gap-6">
                  <InterestGroupEventDrawerImage
                    imageUrl={interestGroupEvent.imageUrl}
                    title={interestGroupEvent.title}
                  />

                  <div className="flex flex-col gap-2">
                    <Title
                      element="h1"
                      size="xl"
                      title={interestGroupEvent.title}
                      className="text-3xl sm:text-4xl sm:line-clamp-3"
                    >
                      {interestGroupEvent.title}
                    </Title>
                    <DrawerDescription className="sr-only">{groupName}</DrawerDescription>
                    <Link
                      href={createGroupPageUrl(interestGroupEvent.interestGroup)}
                      className="flex min-w-0 w-fit items-center gap-2 text-xs text-muted-foreground hover:underline hover:underline-offset-2"
                    >
                      <GroupLogo
                        src={interestGroupEvent.interestGroup.imageUrl}
                        alt={groupName}
                        height={16}
                        width={16}
                        containerClassName="rounded-full size-4 bg-gray-50 dark:bg-stone-700"
                      />
                      {groupName}
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

                  <section className="flex flex-col gap-3 rounded-xl bg-gray-50 px-3 py-3 dark:bg-stone-800/60">
                    <InterestGroupEventRegistrationDateInfo
                      registerEnd={interestGroupEvent.registerEnd}
                      deregisterDeadline={interestGroupEvent.deregisterDeadline}
                    />

                    <div className="flex flex-col gap-2">
                      <InterestGroupEventRegistrations
                        variant="box"
                        interestGroupEvent={interestGroupEvent}
                        eventHasEnded={eventHasEnded}
                        userId={userId}
                      />

                      {joinButton}
                    </div>
                  </section>

                  <section className="flex flex-col gap-2">
                    <Text size="sm" className="text-muted-foreground">
                      Om arrangementet
                    </Text>
                    <RichText content={interestGroupEvent.description} className="max-w-full prose-img:max-w-full" />
                  </section>
                </div>
              )}
            </div>
          </ScrollArea.Viewport>

          <ScrollArea.Scrollbar orientation="vertical" className="flex w-2.5 touch-none select-none p-0.5">
            <ScrollArea.Thumb className="flex-1 rounded-full bg-gray-400/30 hover:bg-gray-400 dark:bg-stone-700 dark:hover:bg-stone-500 transition-colors" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </DrawerContent>
    </Drawer>
  )
}

function InterestGroupEventDrawerImage({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  return (
    <Tilt
      scale={1}
      tiltMaxAngleX={0.25}
      tiltMaxAngleY={0.25}
      glareMaxOpacity={0.1}
      glareBorderRadius="var(--radius-xl)"
      className="rounded-xl bg-gray-100 dark:bg-stone-800/50"
    >
      <div className="group relative w-full aspect-video md:aspect-24/9 overflow-hidden rounded-xl">
        {imageUrl ? (
          // biome-ignore lint/performance/noImgElement: unoptimized next/image crashes iOS Safari (#3062)
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full rounded-xl will-change-transform transition-transform duration-500 ease-out object-contain"
            loading="eager"
          />
        ) : (
          <PlaceHolderImage alt={title} variant="SOCIAL" className="h-full w-full rounded-xl" />
        )}
      </div>
    </Tilt>
  )
}
