import { auth } from "@/auth"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { EventList } from "@/components/organisms/EventList/index"
import { server } from "@/utils/trpc/server"
import { type Membership, createGroupPageUrl, getMembershipGrade } from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, Button, Icon, ReadMore, Text, Title } from "@dotkomonline/ui"
import { formatDistanceToNowStrict } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"

const AUTHORIZE_WITH_FEIDE = (profileSlug: string) =>
  `/api/auth/authorize?connection=FEIDE&redirectAfter=/profil/${profileSlug}` as const

function membershipDescription(membership: Membership) {
  switch (membership.type) {
    case "BACHELOR":
      return "Bachelor"
    case "MASTER":
      return "Master"
    case "SOCIAL":
      return "Sosialt medlem"
    case "KNIGHT":
      return "Ridder"
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

export default async function ProfilePage({ params }: { params: Promise<{ profileSlug: string }> }) {
  const { profileSlug: rawProfileSlug } = await params
  const profileSlug = decodeURIComponent(rawProfileSlug)

  const user = await server.user.getByProfileSlug.query(profileSlug)

  const [session, groups, interestGroups, events] = await Promise.all([
    auth.getServerSession(),
    server.group.allByMember.query(user.id),
    server.interestGroup.getByMember.query(user.id),
    server.event.allByUserIdWithAttendance.query({ id: user.id }),
  ])

  const allGroups = [
    ...groups.map((group) => ({
      ...group,
      pageUrl: createGroupPageUrl(group),
    })),
    ...interestGroups.map((group) => ({
      ...group,
      pageUrl: `/interessegrupper/${group.id}`,
    })),
  ]

  const isUser = user.id === session?.sub

  const grade = getMembershipGrade(user.membership)

  return (
    <div className="flex flex-row gap-8 w-full">
      <Avatar className="w-32 h-32">
        <AvatarImage src={user.image ?? undefined} />
        <AvatarFallback className="bg-gray-200 dark:bg-stone-700">
          <Icon className="text-6xl" icon="tabler:user" />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-8 w-full mr-40">
        <div className="flex flex-col gap-2 grow">
          {isUser ? (
            <div className="flex flex-row w-full justify-between">
              <Title element="h1" size="xl" className="font-semibold">
                {user.name}
              </Title>
              <Button color="dark">Rediger profil</Button>
            </div>
          ) : (
            <Title element="h1">{user.name}</Title>
          )}

          <div className="flex flex-row items-center gap-2 text-sm">
            {user.membership ? (
              <Text>
                {grade && `${grade}. klasse (`}
                {membershipDescription(user.membership)}
                {grade && ")"}
              </Text>
            ) : (
              <Text className="text-gray-500 dark:text-stone-500">Ingen klasseinformasjon</Text>
            )}

            <Icon icon="tabler:point-filled" className="text-gray-500 dark:text-stone-500" />

            {user.createdAt && (
              <Text>{capitalizeFirstLetter(formatDistanceToNowStrict(user.createdAt, { locale: nb }))} i Online</Text>
            )}
          </div>

          <div className="flex flex-row items-center gap-2 text-sm">
            {user.compiled && (
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

        {isUser && (
          <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-stone-800 rounded-xl">
            <div className="flex flex-col gap-4">
              <Title>Din bruker</Title>
              <div className="flex flex-row gap-8">
                <div className="flex flex-col gap-2">
                  {renderUserInfo("E-post", user.email)}
                  {renderUserInfo("Kjønn", user.gender)}
                  {renderUserInfo("Telefon", user.phone)}
                  {renderUserInfo("Allergier", user.allergies || "Ingen allergier")}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Title>Medlemskap</Title>

              <div className="flex flex-row gap-2 items-center p-3 bg-gray-100 dark:bg-stone-800 rounded-md w-fit">
                {user.membership ? (
                  <>
                    <Icon icon="tabler:notes" className="text-2xl text-gray-500 dark:text-stone-500" />
                    <div className="flex flex-col gap-1">
                      <Text className="text-xl">{membershipDescription(user.membership)}</Text>
                      {user.membership.specialization && <Text>{user.membership.specialization}</Text>}
                      <Text>Startet studiet i {user.membership.start_year}</Text>
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
                color={user.membership ? "light" : "brand"}
                variant={user.membership ? "outline" : "solid"}
                element="a"
                href={AUTHORIZE_WITH_FEIDE(profileSlug)}
                className="h-fit w-fit"
              >
                {user.membership ? "Oppdater medlemskap" : "Registrer medlemskap"}
              </Button>

              <Text className="text-gray-500 dark:text-stone-500 text-sm">
                For å {user.membership ? "oppdatere medlemskapet" : "registrere medlemskap"} må du logge inn med Feide.
                Dersom du oppdager feil, ta kontakt med Hovedstyret.
              </Text>
            </div>
          </div>
        )}

        {allGroups.length > 0 && (
          <div className="flex flex-col gap-4 p-4 border border-gray-200 dark:border-stone-800 rounded-xl">
            <Title>Grupper</Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allGroups.map((group) => (
                <Link
                  key={group.id}
                  href={group.pageUrl}
                  className="flex flex-row items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={group.image ?? undefined} />
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
          <div className="flex flex-col gap-4 p-4 border border-gray-200 dark:border-stone-800 rounded-xl">
            <Title>Arrangementer</Title>

            <EventList attendanceEvents={events} />
          </div>
        )}
      </div>
    </div>
  )
}
