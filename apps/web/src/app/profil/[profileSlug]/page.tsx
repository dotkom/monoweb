import { auth } from "@/auth"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { EventList } from "@/components/organisms/EventList/index"
import { server } from "@/utils/trpc/server"
import {
  type Membership,
  type MembershipSpecialization,
  type VisiblePersonalMarkDetails,
  createGroupPageUrl,
  getActiveMembership,
  getMembershipGrade,
} from "@dotkomonline/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@dotkomonline/ui"
import { Avatar, AvatarFallback, AvatarImage, Button, Icon, ReadMore, Text, Title, cn } from "@dotkomonline/ui"
import { getPunishmentExpiryDate } from "@dotkomonline/utils"
import { formatDate, formatDistanceToNowStrict, isPast } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"

const AUTHORIZE_WITH_FEIDE = (profileSlug: string) =>
  `/api/auth/authorize?connection=FEIDE&redirectAfter=/profil/${profileSlug}` as const

const getMembershipTypeString = (membership: Membership) => {
  switch (membership.type) {
    case "BACHELOR_STUDENT":
      return "Bachelor"
    case "MASTER_STUDENT":
      return "Master"
    case "SOCIAL_MEMBER":
      return "Sosialt medlem"
    case "KNIGHT":
      return "Ridder"
    case "PHD_STUDENT":
      return "PhD-student"
  }
}

const getSpecializationString = (specialization: MembershipSpecialization) => {
  switch (specialization) {
    case "ARTIFICIAL_INTELLIGENCE":
      return "Kunstig intelligens"
    case "DATABASE_AND_SEARCH":
      return "Database og søk"
    case "INTERACTION_DESIGN":
      return "Interaksjonsdesign"
    case "SOFTWARE_ENGINEERING":
      return "Programvareutvikling"
    case "UNKNOWN":
      return "Ukjent spesialisering"
  }
}

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

  return (
    <div className={cn("rounded-lg p-4 bg-gray-100 flex flex-col align-start gap-2", !hasExpired && "bg-red-200")}>
      <div className="flex gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="tabler:alert-hexagon" className="text-4xl" />
          <Title>{mark.title}</Title>
        </div>
        {hasExpired ? <Text>Utløpt</Text> : <Text>Utløper {formatDistanceToNowStrict(expires)}</Text>}
      </div>
      <div className="flex justify-between">
        <Text>{mark.details}</Text>
        <Text>
          Gitt {formatDate(personalMark.createdAt, "dd.MM.yyyy")} av {mark.groupSlug}
        </Text>
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
    isUser ? server.personalMark.getVisibleInformationForUser.query({ id: user.id }) : Promise.resolve([]),
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
                {getMembershipTypeString(activeMembership)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-3 p-4 border border-gray-200 dark:border-stone-800 rounded-xl">
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

            <div className="flex flex-row gap-4 items-center p-6 bg-gray-100 dark:bg-stone-800 rounded-xl w-fit">
              {activeMembership ? (
                <>
                  <Icon icon="tabler:notes" className="text-2xl text-gray-500 dark:text-stone-500" />
                  <div className="flex flex-col gap-1">
                    <Text className="text-xl">{getMembershipTypeString(activeMembership)}</Text>
                    {activeMembership.specialization && (
                      <Text>{getSpecializationString(activeMembership.specialization)}</Text>
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
          {marks.length > 0 ? (
            <div className="flex flex-col gap-3">
              <Title>Prikker og suspensjoner</Title>
              <div className="flex flex-col gap-2">
                {marks.map((markInfo) => (
                  <MarkDisplay key={markInfo.mark.id} markInformation={markInfo} />
                ))}
              </div>
            </div>
          ) : null}
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
