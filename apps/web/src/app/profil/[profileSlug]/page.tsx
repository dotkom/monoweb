import { EventList } from "@/app/arrangementer/components/EventList"
import { auth } from "@/auth"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { server } from "@/utils/trpc/server"
import {
  type VisiblePersonalMarkDetails,
  createGroupPageUrl,
  getActiveMembership,
  getMembershipGrade,
  getMembershipTypeName,
  getSpecializationName,
} from "@dotkomonline/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Icon,
  RadialProgress,
  ReadMore,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from "@dotkomonline/ui"
import { getPunishmentExpiryDate } from "@dotkomonline/utils"
import { differenceInMilliseconds, formatDate, formatDistanceToNowStrict, isPast } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useMemo } from "react"

const AUTHORIZE_WITH_FEIDE = (profileSlug: string) =>
  `/api/auth/authorize?connection=FEIDE&redirectAfter=/profil/${profileSlug}` as const

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const renderUserInfo = (label: string, value: string | number | null) => {
  if (value === null || value === undefined) {
    return (
      <div className="flex flex-row gap-1 items-center">
        <Text>{label}:</Text>
        <Text className="text-gray-500 dark:text-stone-500">Ingen informasjon</Text>
      </div>
    )
  }
  return (
    <div className="flex flex-row gap-1 items-center">
      <Text>{label}:</Text>
      <Text>{value}</Text>
    </div>
  )
}

function MarkDisplay({
  markInformation: { mark, personalMark },
}: {
  markInformation: VisiblePersonalMarkDetails
}) {
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
        "p-3 border rounded-md flex flex-row gap-3 justify-between w-full border-gray-200 dark:border-stone-800",
        hasExpired && "text-gray-500 dark:text-stone-500"
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
                  {!hasExpired && <Icon icon="tabler:point-filled" className="text-red-500 text-xl -mx-1" />}
                  <Text className={cn(!hasExpired && "text-lg font-medium")}>{mark.title}</Text>
                </div>
                <div className={cn("flex flex-row gap-2 items-center")}>
                  <Text>
                    {mark.weight} prikk{mark.weight !== 1 ? "er" : ""}
                  </Text>

                  <Icon icon="tabler:point-filled" className="text-gray-500 dark:text-stone-500" />

                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger className="flex flex-row items-center gap-2">
                        <RadialProgress percentage={percentageLeft} size={16} strokeWidth={4} reverse hideText />

                        <Text>Utløper om {formatDistanceToNowStrict(expires)}</Text>
                      </TooltipTrigger>
                      <TooltipContent>
                        <Text className="text-xs text-gray-500 dark:text-stone-500">
                          Utløper {formatDate(expires, "dd. MMMM yyyy HH:mm")}
                        </Text>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}

            <Text className="text-sm">{mark.details}</Text>
          </div>

          <Text className={cn("text-xs text-gray-500 dark:text-stone-500")}>
            Gitt {formatDate(personalMark.createdAt, "dd. MMM yyyy")} av {mark.groupSlug}
          </Text>
        </div>
      </div>
    </div>
  )
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileSlug: string }>
}) {
  const { profileSlug: rawProfileSlug } = await params
  const profileSlug = decodeURIComponent(rawProfileSlug)

  const [user, session] = await Promise.all([server.user.findByProfileSlug.query(profileSlug), auth.getServerSession()])

  if (!user) {
    notFound()
  }

  // "Compilation" is an inaugural tradition in Online where you "officially" become a member
  const isCompiled = false // TODO: Reimplement compilation with flags
  const isLoggedIn = Boolean(session)
  const isUser = user.id === session?.sub

  const [groups, events, marks] = await Promise.all([
    server.group.allByMember.query(user.id),
    isLoggedIn ? server.event.allByAttendingUserId.query({ id: user.id }) : Promise.resolve([]),
    isUser ? server.personalMark.getVisibleInformation.query({ userId: user.id }) : Promise.resolve([]),
  ])

  const allGroups = [
    ...groups.map((group) => ({
      ...group,
      pageUrl: createGroupPageUrl(group),
    })),
  ]

  const activeMembership = getActiveMembership(user)
  const grade = activeMembership ? getMembershipGrade(activeMembership) : null

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-row gap-4">
        <Avatar className="w-16 h-16 md:w-32 md:h-32">
          <AvatarImage src={user.imageUrl ?? undefined} />
          <AvatarFallback className="bg-gray-200 dark:bg-stone-700">
            <Icon className="text-6xl" icon="tabler:user" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2 grow">
          <div className="flex flex-row w-full justify-between">
            <Title element="h1" className="font-semibold text-xl md:text-2xl">
              {user.name}
            </Title>
            {isUser && (
              <Button color="dark" className="hidden md:block">
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
              <Text className="text-gray-500 dark:text-stone-500">Ingen klasseinformasjon</Text>
            )}

            <Icon icon="tabler:point-filled" className="text-gray-500 dark:text-stone-500 hidden md:block" />

            {user.createdAt && (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger>
                    <Text>{capitalizeFirstLetter(formatDistanceToNowStrict(user.createdAt))} i Online</Text>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Text className="text-xs text-gray-500 dark:text-stone-500">
                      Registrert {formatDate(user.createdAt, "dd. MMMM yyyy HH:mm")}
                    </Text>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex flex-row items-center gap-2 text-sm">
            {isCompiled && (
              <div className="flex flex-row items-center w-fit gap-2 p-1.5 bg-gray-100 dark:bg-stone-800 rounded-md">
                <OnlineIcon height={16} width={16} />
                <Text>Kompilert</Text>
              </div>
            )}
          </div>

          {user.biography ? (
            <ReadMore>{user.biography}</ReadMore>
          ) : (
            <Text className="text-gray-500 dark:text-stone-500">Ingen biografi</Text>
          )}
        </div>
      </div>

      {isUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-gray-200 dark:border-stone-800 rounded-xl">
          <div className="flex flex-col gap-3">
            <Title>Din bruker</Title>
            <div className="flex flex-row gap-8">
              <div className="flex flex-col gap-2">
                {renderUserInfo("Brukernavn", user.profileSlug)}
                {renderUserInfo("E-post", user.email)}
                {renderUserInfo("Kjønn", user.gender || "Ikke oppgitt")}
                {renderUserInfo("Telefon", user.phone)}
                {renderUserInfo("Allergier", user.dietaryRestrictions || "Ingen allergier")}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Title>Medlemskap</Title>

            <div className="flex flex-row gap-4 items-center p-6 bg-gray-50 dark:bg-stone-900 rounded-xl w-fit">
              {activeMembership ? (
                <>
                  <Icon icon="tabler:notes" className="text-2xl text-gray-500 dark:text-stone-500" />
                  <div className="flex flex-col gap-1">
                    <Text className="text-xl font-medium">{getMembershipTypeName(activeMembership.type)}</Text>
                    {activeMembership.specialization && (
                      <Text>{getSpecializationName(activeMembership.specialization)}</Text>
                    )}
                    <Text>{grade}. klasse</Text>
                    <Text className="text-xs text-gray-500 dark:text-stone-500">
                      Medlemskapet varer fra {formatDate(activeMembership.start, "MMM yyyy")} til{" "}
                      {formatDate(activeMembership.end, "MMM yyyy")}
                    </Text>
                  </div>
                </>
              ) : (
                <>
                  <Icon icon="tabler:notes-off" className="text-2xl text-gray-500 dark:text-stone-500" />
                  <Text className="text-xl">Ingen medlemskap</Text>
                </>
              )}
            </div>

            {!activeMembership ? (
              <>
                <Button
                  color={activeMembership ? "light" : "brand"}
                  variant={activeMembership ? "outline" : "solid"}
                  element="a"
                  href={AUTHORIZE_WITH_FEIDE(profileSlug)}
                  className="h-fit w-fit"
                >
                  Registrer medlemskap
                </Button>

                <Text className="text-gray-500 dark:text-stone-500 text-sm">
                  For å registrere medlemskap må du logge inn med Feide. Dersom du oppdager feil, ta kontakt med
                  Hovedstyret.
                </Text>
              </>
            ) : (
              <Text className="text-gray-500 dark:text-stone-500 text-sm">
                Ved feil angitt informasjon, ta kontakt med{" "}
                <Button
                  element="a"
                  href="/komiteer/hs"
                  variant="text"
                  className="-ml-0.5 text-sm text-gray-500 dark:text-stone-500"
                >
                  Hovedstyret
                </Button>
              </Text>
            )}
          </div>

          {marks.length > 0 && (
            <div className="flex flex-col gap-3">
              <Title>Prikker og suspensjoner</Title>
              <div className="flex flex-col gap-2">
                {marks.map((markInfo) => (
                  <MarkDisplay key={markInfo.mark.id} markInformation={markInfo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {allGroups.length > 0 && (
        <div className="flex flex-col gap-3 md:p-4 md:border md:border-gray-200 md:dark:border-stone-800 md:rounded-xl">
          <Title>Grupper</Title>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allGroups.map((group) => (
              <Link
                key={group.slug}
                href={group.pageUrl}
                className="flex flex-row items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-stone-900 dark:hover:bg-stone-800 transition-colors"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={group.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
                    <Icon className="text-3xl" icon="tabler:photo" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <Text className="text-lg">{group.name}</Text>
                  <Text className="text-sm text-wrap overflow-hidden line-clamp-2">
                    {group.description || group.about}
                  </Text>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:p-4 md:border md:border-gray-200 md:dark:border-stone-800 md:rounded-xl">
        <Title>Arrangementer</Title>

        {isLoggedIn ? (
          <EventList events={events} />
        ) : (
          <div className="flex flex-row items-center gap-2 text-gray-500 dark:text-stone-500">
            <Icon icon="tabler:lock" className="text-lg" /> <Text>Du må være innlogget for å se arrangementer.</Text>
          </div>
        )}
      </div>
    </div>
  )
}
