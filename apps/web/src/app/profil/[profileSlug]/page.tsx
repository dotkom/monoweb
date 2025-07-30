import { auth } from "@/auth"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { EventList } from "@/components/organisms/EventList/index"
import { server } from "@/utils/trpc/server"
import {
  type Membership,
  type PersonalMarkVisibleInformation,
  createGroupPageUrl,
  getActiveMembership,
  getMembershipGrade,
} from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, Button, Icon, ReadMore, Text, Title, cn } from "@dotkomonline/ui"
import { formatDate, formatRelativeTime } from "@dotkomonline/utils"
import { addDays, formatDistanceToNowStrict, getYear } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"

const AUTHORIZE_WITH_FEIDE = (profileSlug: string) =>
  `/api/auth/authorize?connection=FEIDE&redirectAfter=/profil/${profileSlug}` as const

function membershipDescription(membership: Membership) {
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
  markInformation: PersonalMarkVisibleInformation
}) {
  const expires = addDays(personalMark.createdAt, mark.duration)
  const hasExpired = expires < new Date()

  return (
    <div
      className={cn(
        "rounded-lg p-4 bg-gray-100 flex flex-col align-start gap-2",
        !hasExpired && "bg-red-500 text-white"
      )}
    >
      <div className="flex gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Icon icon="tabler:alert-hexagon" className="text-4xl" />
          <h2 className="font-bold text-lg">{mark.title}</h2>
        </div>
        {hasExpired ? <p>Utløpt</p> : <p>Utløper {formatRelativeTime(expires)}</p>}
      </div>
      <div className="flex justify-between">
        <p>{mark.details}</p>
        <p>
          Gitt {formatDate(personalMark.createdAt)} av {mark.groupSlug}
        </p>
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

  const user = await server.user.getByProfileSlug.query(profileSlug)

  const [session, groups, events, marks] = await Promise.all([
    auth.getServerSession(),
    server.group.allByMember.query(user.id),
    server.event.allByAttendingUserId.query({ id: user.id }),
    server.personalMark.getVisibleInformationByUser.query({ id: user.id }),
  ])

  const allGroups = [
    ...groups.map((group) => ({
      ...group,
      pageUrl: createGroupPageUrl(group),
    })),
  ]

  const isUser = user.id === session?.sub

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
                {membershipDescription(activeMembership)}
                {grade && ")"}
              </Text>
            ) : (
              <Text className="text-gray-500 dark:text-stone-500">Ingen klasseinformasjon</Text>
            )}

            <Icon icon="tabler:point-filled" className="text-gray-500 dark:text-stone-500 hidden md:block" />

            {user.createdAt && (
              <Text>{capitalizeFirstLetter(formatDistanceToNowStrict(user.createdAt, { locale: nb }))} i Online</Text>
            )}
          </div>

          <div className="flex flex-row items-center gap-2 text-sm">
            {
              // TODO: Reimplement compilation with flags
              false && (
                <div className="flex flex-row items-center w-fit gap-2 p-1.5 bg-gray-100 dark:bg-stone-800 rounded-md">
                  <OnlineIcon height={16} width={16} />
                  <Text>Kompilert</Text>
                </div>
              )
            }
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
                {renderUserInfo("E-post", user.email)}
                {renderUserInfo("Kjønn", user.gender)}
                {renderUserInfo("Telefon", user.phone)}
                {renderUserInfo("Allergier", user.dietaryRestrictions || "Ingen allergier")}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Title>Medlemskap</Title>

            <div className="flex flex-row gap-2 items-center p-3 bg-gray-100 dark:bg-stone-800 rounded-md w-fit">
              {activeMembership ? (
                <>
                  <Icon icon="tabler:notes" className="text-2xl text-gray-500 dark:text-stone-500" />
                  <div className="flex flex-col gap-1">
                    <Text className="text-xl">{membershipDescription(activeMembership)}</Text>
                    {activeMembership.specialization && <Text>{activeMembership.specialization}</Text>}
                    <Text>Startet studiet i {getYear(activeMembership.start)}</Text>
                  </div>
                </>
              ) : (
                <>
                  <Icon icon="tabler:notes-off" className="text-2xl text-gray-500 dark:text-stone-500" />
                  <Text className="text-xl">Ingen medlemskap</Text>
                </>
              )}
            </div>

            <Button
              color={activeMembership ? "light" : "brand"}
              variant={activeMembership ? "outline" : "solid"}
              element="a"
              href={AUTHORIZE_WITH_FEIDE(profileSlug)}
              className="h-fit w-fit"
            >
              {activeMembership ? "Oppdater medlemskap" : "Registrer medlemskap"}
            </Button>

            <Text className="text-gray-500 dark:text-stone-500 text-sm">
              For å {activeMembership ? "oppdatere medlemskapet" : "registrere medlemskap"} må du logge inn med Feide.
              Dersom du oppdager feil, ta kontakt med Hovedstyret.
            </Text>
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
                  <Title size="sm" className="font-medium">
                    {group.name}
                  </Title>
                  <Text className="text-sm text-wrap overflow-hidden line-clamp-2">{group.description}</Text>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="flex flex-col gap-3 md:p-4 md:border md:border-gray-200 md:dark:border-stone-800 md:rounded-xl">
          <Title>Arrangementer</Title>

          <EventList events={events} />
        </div>
      )}
    </div>
  )
}
