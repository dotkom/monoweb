import { auth } from "@/auth"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { server } from "@/utils/trpc/server"
import { type Membership, getMembershipGrade } from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, Button, Icon, ReadMore, Text, Title } from "@dotkomonline/ui"
import { group } from "console"
import { formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"

const REGISTER_HREF = "/api/auth/authorize?connection=FEIDE&redirectAfter=/profile"

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

  const user = await server.user.getByProfileSlug.query(rawProfileSlug)

  const [session, groups, interestGroups] = await Promise.all([
    auth.getServerSession(),
    server.group.allByMember.query(user.id),
    server.interestGroup.getByMember.query(user.id),
  ])
  
  const isUser = user.id === session?.sub

  const grade = getMembershipGrade(user.membership)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row gap-8 w-full">
        <Avatar className="w-32 h-32">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="bg-gray-500 dark:bg-stone-600">
            <Icon className="text-lg" icon="tabler:user" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2 grow">
          <div className="flex flex-row w-full justify-between">
            <Title element="h1">{user.name}</Title>
            <Button element="a" href="/settings" color="brand">
              Profilinnstillinger
            </Button>
          </div>

          <div className="flex flex-row items-center gap-4 text-sm">
            {user.membership ? (
              <Text>
                {grade && `${grade}. klasse (`}
                {membershipDescription(user.membership)}
                {grade && ")"}
              </Text>
            ) : (
              <>
                <Text>Ingen medlemsskap</Text>
                <Button color="brand" element="a" href={REGISTER_HREF}>
                  Bekreft med FEIDE
                </Button>
              </>
            )}

            {user.createdAt && <Text>Siden {formatDistanceToNow(user.createdAt, { locale: nb })}</Text>}
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

          <div className="flex flex-row items-center gap-4">
            {[...groups, ...interestGroups].map((group) => (
              <div key={group.id} className="flex flex-row items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={group.image ?? undefined} />
                  <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
                    <Icon className="text-lg" icon="tabler:users" />
                  </AvatarFallback>
                </Avatar>
                <Text className="text-sm">{group.name}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isUser && (
        <div className="flex flex-col gap-4 p-3 bg-gray-100 dark:bg-stone-800 rounded-lg">
          <Title>Din bruker</Title>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              {renderUserInfo("E-post", user.email)}
              {renderUserInfo("Kjønn", user.gender)}
              {renderUserInfo("Telefon", user.phone)}
              {renderUserInfo("Allergier", user.allergies || "Ingen allergier")}
            </div>

            <Text>membership: {JSON.stringify(user.membership, null, 2)}</Text>
          </div>
        </div>
      )}
    </div>
  )
}
