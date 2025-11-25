"use client"

import { EventList } from "@/app/arrangementer/components/EventList"
import { useEventAllByAttendingUserIdInfiniteQuery } from "@/app/arrangementer/components/queries"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import {
  type Membership,
  type VisiblePersonalMarkDetails,
  createGroupPageUrl,
  findActiveMembership,
  getMembershipGrade,
  getMembershipTypeName,
  getSpecializationName,
} from "@dotkomonline/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  RadialProgress,
  ReadMore,
  RichText,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@dotkomonline/ui"
import { capitalizeFirstLetter, createAuthorizeUrl, getCurrentUTC, getPunishmentExpiryDate } from "@dotkomonline/utils"
import {
  IconAlertTriangle,
  IconChefHatOff,
  IconEdit,
  IconGenderBigender,
  IconLock,
  IconMail,
  IconNotes,
  IconNotesOff,
  IconPhone,
  IconPhoto,
  IconPointFilled,
  IconUser,
} from "@tabler/icons-react"
import { useQueries } from "@tanstack/react-query"
import { differenceInMilliseconds, formatDate, formatDistanceToNowStrict, isPast } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import { notFound, useParams, useSearchParams } from "next/navigation"
import { type ElementType, useMemo } from "react"
import { PenaltyDialog } from "./components/PenaltyDialog"
import SkeletonProfilePage from "./loading"

const UserProp = (props: { label: string; value: string | number | null; icon: ElementType }) => {
  const Icon = props.icon

  return (
    <>
      <div className="flex flex-row gap-2 items-center">
        <Icon className="size-5" />
        <Text>{props.label}:</Text>
      </div>
      {props.value !== null ? (
        <Text>{props.value}</Text>
      ) : (
        <Text className="text-gray-500 dark:text-stone-400">Ingen informasjon</Text>
      )}
    </>
  )
}

function MarkDisplay({ markInformation: { mark, personalMark } }: { markInformation: VisiblePersonalMarkDetails }) {
  const expires = getPunishmentExpiryDate(personalMark.createdAt, mark.duration)
  const hasExpired = isPast(expires)

  const percentageLeft = useMemo(() => {
    const totalDuration = differenceInMilliseconds(expires, personalMark.createdAt)
    const remainingDuration = Math.max(0, differenceInMilliseconds(expires, new Date()))
    const ratio = Math.min(1, Math.max(0, remainingDuration / totalDuration))

    return ratio * 100
  }, [expires, personalMark.createdAt])

  return (
    <div
      className={cn(
        "p-3 border rounded-md flex flex-row gap-3 justify-between w-full border-gray-200 dark:border-stone-700",
        hasExpired && "text-gray-500 dark:text-stone-400"
      )}
    >
      <div className="flex gap-3 items-center h-fit w-full">
        <div className="flex flex-col gap-3 w-full">
          <div className={cn("flex flex-col", hasExpired ? "gap-1" : "gap-2")}>
            {hasExpired ? (
              <Text className="text-base">{mark.title}</Text>
            ) : (
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex flex-row gap-1 items-center">
                  {!hasExpired && <IconPointFilled className="text-red-500 -mx-1" width={20} height={20} />}
                  <Text className={cn(!hasExpired && "text-lg font-medium")}>{mark.title}</Text>
                </div>
                <div className={cn("flex flex-row gap-2 items-center")}>
                  <Text>
                    {mark.weight} prikk{mark.weight !== 1 ? "er" : ""}
                  </Text>

                  <IconPointFilled className="text-gray-500 dark:text-stone-400" width={16} height={16} />

                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="flex flex-row items-center gap-2">
                      <RadialProgress percentage={percentageLeft} size={16} strokeWidth={4} reverse hideText />

                      <Text>Utløper om {formatDistanceToNowStrict(expires)}</Text>
                    </TooltipTrigger>
                    <TooltipContent>
                      <Text className="text-xs text-gray-500 dark:text-stone-400">
                        Utløper {formatDate(expires, "dd. MMMM yyyy HH:mm")}
                      </Text>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            <Text className="text-sm">{mark.details}</Text>
          </div>

          <Text className={cn("text-xs text-gray-500 dark:text-stone-400")}>
            Gitt {formatDate(personalMark.createdAt, "dd. MMM yyyy")} av{" "}
            {mark.groups.map((group) => group.abbreviation).join(", ")}
          </Text>
        </div>
      </div>
    </div>
  )
}

const MembershipDisplay = ({
  activeMembership,
  grade,
}: {
  activeMembership: Membership | null
  grade: number | null
}) => {
  if (activeMembership) {
    return (
      <>
        <IconNotes className="text-gray-500 dark:text-stone-400" width={32} height={32} />
        <div className="flex flex-col gap-1">
          <Text className="text-xl font-medium">{getMembershipTypeName(activeMembership.type)}</Text>
          {activeMembership.specialization && <Text>{getSpecializationName(activeMembership.specialization)}</Text>}
          <Text>{grade}. klasse</Text>
          <Text className="text-xs text-gray-500 dark:text-stone-400">
            Medlemskapet varer fra {formatDate(activeMembership.start, "MMM yyyy")} til{" "}
            {formatDate(activeMembership.end, "MMM yyyy")}
          </Text>
        </div>
      </>
    )
  }

  return (
    <>
      <IconNotesOff className="text-gray-500 dark:text-stone-400" width={32} height={32} />
      <Text className="text-xl">Ingen medlemskap</Text>
    </>
  )
}

export default function ProfilePage() {
  const now = useMemo(() => getCurrentUTC(), [])

  const { profileSlug: rawProfileSlug } = useParams<{ profileSlug: string }>()
  const profileSlug = decodeURIComponent(rawProfileSlug)
  const returnedFromFeide = Boolean(useSearchParams().get("returnedFromFeide"))

  const trpc = useTRPC()
  const session = useSession()
  const fullPathname = useFullPathname()

  const [userResult, isStaffResult] = useQueries({
    queries: [trpc.user.findByProfileSlug.queryOptions(profileSlug), trpc.user.isStaff.queryOptions()],
  })

  const { data: user, isLoading: userLoading } = userResult
  const { data: isStaff = false } = isStaffResult

  // "Compilation" is an inaugural tradition in Online where you "officially" become a member
  const isCompiled = false // TODO: Reimplement compilation with flags
  const isLoggedIn = Boolean(session)
  const isUser = user ? user.id === session?.sub : false

  const [
    { data: groups, isLoading: groupsLoading },
    { data: futureEventWithAttendances, isLoading: futureEventWithAttendancesLoading },
    { data: marks, isLoading: marksLoading },
    { data: eventsMissingFeedback },
  ] = useQueries({
    queries: [
      trpc.group.allByMember.queryOptions(user?.id ?? "", { enabled: isLoggedIn && Boolean(user?.id) }),
      trpc.event.allByAttendingUserId.queryOptions(
        {
          id: user?.id ?? "",
          filter: {
            byEndDate: {
              min: now,
              max: null,
            },
            excludingType: isStaff ? [] : undefined,
          },
        },
        { enabled: isLoggedIn && Boolean(user?.id) }
      ),
      trpc.personalMark.getVisibleInformation.queryOptions({ userId: user?.id ?? "" }, { enabled: isUser }),
      trpc.event.findUnansweredByUser.queryOptions(user?.id ?? "", { enabled: isUser }),
    ],
  })

  const { eventDetails: pastEventWithAttendances, fetchNextPage } = useEventAllByAttendingUserIdInfiniteQuery({
    id: user?.id ?? "",
    filter: {
      byEndDate: {
        max: now,
        min: null,
      },
      excludingType: isStaff ? [] : undefined,
    },
    enabled: isLoggedIn && Boolean(user?.id),
  })

  const allGroups = useMemo(
    () =>
      groups
        ? [
            ...groups.map((group) => ({
              ...group,
              pageUrl: createGroupPageUrl(group),
            })),
          ]
        : [],
    [groups]
  )

  if (user === undefined || userLoading) {
    return <SkeletonProfilePage />
  }

  if (user === null) {
    notFound()
  }

  const activeMembership = findActiveMembership(user)
  const grade = activeMembership ? getMembershipGrade(activeMembership) : null

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-row gap-4">
        <Avatar className="w-16 h-16 md:w-32 md:h-32">
          <AvatarImage src={user.imageUrl ?? undefined} />
          <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
            <IconUser width={64} height={64} />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2 grow">
          <div className="flex flex-row w-full justify-between">
            <Title element="h1" className="font-semibold text-xl md:text-2xl">
              {user.name}
            </Title>
            {isUser && (
              <Button
                element={Link}
                href="/innstillinger/profil"
                color="dark"
                icon={<IconEdit width={20} height={20} />}
                className="hidden gap-2 md:flex"
              >
                Rediger profil
              </Button>
            )}
          </div>

          <div className="flex flex-col text-sm gap-1 md:flex-row md:items-center md:gap-2">
            {activeMembership ? (
              <Text>
                {grade && `${grade}. klasse (`}
                {getMembershipTypeName(activeMembership.type)}
                {grade && ")"}
              </Text>
            ) : (
              <Text className="text-gray-500 dark:text-stone-400">Ingen klasseinformasjon</Text>
            )}

            <IconPointFilled className="text-gray-500 dark:text-stone-400 hidden md:block" width={16} height={16} />

            {user.createdAt && (
              <Tooltip delayDuration={100}>
                <TooltipTrigger>
                  <Text>
                    {capitalizeFirstLetter(formatDistanceToNowStrict(user.createdAt, { locale: nb }))} i Online
                  </Text>
                </TooltipTrigger>
                <TooltipContent>
                  <Text className="text-xs text-gray-500 dark:text-stone-400">
                    Registrert {formatDate(user.createdAt, "dd. MMMM yyyy HH:mm")}
                  </Text>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex flex-row items-center gap-2 text-sm">
            {isCompiled && (
              <div className="flex flex-row items-center w-fit gap-2 p-1.5 bg-gray-100 dark:bg-stone-700 rounded-md">
                <OnlineIcon height={16} width={16} />
                <Text>Kompilert</Text>
              </div>
            )}
          </div>

          {user.biography ? (
            <ReadMore>{user.biography}</ReadMore>
          ) : (
            <Text className="text-gray-500 dark:text-stone-400">Ingen biografi</Text>
          )}
        </div>
      </div>

      {isUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-gray-200 dark:border-stone-700 rounded-xl">
          <div className="flex flex-col gap-3">
            <Title>Din bruker</Title>
            <div className="grid grid-cols-[auto_1fr] items-start gap-3 overflow-x-scroll sm:overflow-hidden text-sm sm:text-base">
              <UserProp label="Brukernavn" value={user.profileSlug} icon={IconUser} />
              <UserProp label="E-post" value={user.email} icon={IconMail} />
              <UserProp label="Kjønn" value={user.gender || "Ikke oppgitt"} icon={IconGenderBigender} />
              <UserProp label="Telefon" value={user.phone} icon={IconPhone} />
              <UserProp
                label="Kostholdsrestriksjoner"
                value={user.dietaryRestrictions || "Ingen kostholdsrestriksjoner"}
                icon={IconChefHatOff}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Title>Medlemskap</Title>

            {returnedFromFeide && (
              <div className="flex items-center dark:bg-red-900 bg-red-600 p-6 text-white rounded-xl gap-4">
                <IconAlertTriangle width={36} height={36} />
                <Text>
                  Vi kunne ikke bekrefte ditt medlemsskap automatisk. Dersom dette er feil ta kontakt med{" "}
                  <Link className="underline" href="/grupper/hs">
                    Hovedstyret
                  </Link>
                  .
                </Text>
              </div>
            )}

            <div className="flex flex-row gap-4 items-center p-6 bg-gray-50 dark:bg-stone-800 rounded-xl w-fit">
              <MembershipDisplay activeMembership={activeMembership} grade={grade} />
            </div>

            {!activeMembership ? (
              <>
                <Button
                  color={activeMembership ? "light" : "brand"}
                  variant={activeMembership ? "outline" : "solid"}
                  element={Link}
                  href={createAuthorizeUrl({
                    connection: "FEIDE",
                    redirectAfter: fullPathname,
                    returnedFromFeide: "true",
                  })}
                  prefetch={false}
                  className="h-fit w-fit"
                >
                  Registrer medlemskap
                </Button>

                {!returnedFromFeide && (
                  <Text className="text-sm text-gray-500 dark:text-stone-500">
                    For å registrere medlemskap må du logge inn med Feide. Dersom du oppdager feil, ta kontakt med{" "}
                    <Link className="underline" href="/grupper/hs">
                      Hovedstyret
                    </Link>
                    .
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-sm text-gray-500 dark:text-stone-500">
                Ved feil angitt informasjon, ta kontakt med{" "}
                <Link className="underline" href="/grupper/hs">
                  Hovedstyret
                </Link>
                .
              </Text>
            )}
          </div>

          {marks && marks.length > 0 && (
            <div className="flex flex-col gap-3">
              <div>
                <Title>Prikker og suspensjoner</Title>
                <PenaltyDialog />
              </div>
              <div className="flex flex-col gap-2">
                {marks.map((markInfo) => (
                  <MarkDisplay key={markInfo.mark.id} markInformation={markInfo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {eventsMissingFeedback && eventsMissingFeedback.length > 0 && (
        <div className="flex flex-col gap-3 md:p-4 md:border md:border-gray-200 md:dark:border-stone-800 md:rounded-xl">
          <Title>Manglende tilbakemelding</Title>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eventsMissingFeedback.map((event) => {
              return (
                <Link
                  key={event.id}
                  href={`/tilbakemelding/${event.id}`}
                  className="flex flex-row items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-stone-900 dark:hover:bg-stone-800 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <Text className="text-lg">{event.title}</Text>
                    <Text className="text-sm text-wrap overflow-hidden line-clamp-2">
                      Gi tilbakemelding på {event.title} som du deltok på{" "}
                      {formatDate(event.start, "dd. MMM yyyy", { locale: nb })}
                    </Text>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {allGroups.length > 0 && (
        <div className="flex flex-col gap-3 md:p-4 md:border md:border-gray-200 md:dark:border-stone-700 md:rounded-xl">
          <Title>Grupper</Title>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allGroups.map((group) => (
              <Link
                key={group.slug}
                href={group.pageUrl}
                className="flex flex-row items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={group.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-gray-200 dark:bg-stone-500">
                    <IconPhoto width={32} height={32} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <Text className="text-lg">{group.name}</Text>
                  <RichText maxLines={3} className="line-clamp-2" hideToggleButton={true} content={group.description} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:p-4 md:border md:border-gray-200 md:dark:border-stone-700 md:rounded-xl">
        <Title>Arrangementer</Title>

        {isLoggedIn ? (
          futureEventWithAttendances !== undefined && pastEventWithAttendances !== undefined ? (
            <EventList
              futureEventWithAttendances={futureEventWithAttendances.items}
              pastEventWithAttendances={pastEventWithAttendances}
              onLoadMore={fetchNextPage}
              viewMode="CHRONOLOGICAL"
            />
          ) : (
            <div className="flex flex-col gap-1">
              <EventListItemSkeleton />
              <EventListItemSkeleton />
              <EventListItemSkeleton />
              <EventListItemSkeleton />
              <EventListItemSkeleton />
            </div>
          )
        ) : (
          <div className="flex flex-row items-center gap-2 text-gray-500 dark:text-stone-400">
            <IconLock width={20} height={20} /> <Text>Du må være innlogget for å se arrangementer.</Text>
          </div>
        )}
      </div>
    </div>
  )
}
