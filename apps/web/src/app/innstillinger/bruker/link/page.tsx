import { auth } from "@/auth"
import { createAuthorizeUrl, getStudyGrade } from "@dotkomonline/utils"
import { Avatar, AvatarFallback, AvatarImage, cn, Text, Title } from "@dotkomonline/ui"
import { redirect } from "next/navigation"
import { ConfirmIdentityLinkButton } from "./ConfirmIdentityLinkButton"
import { getIdentityLinkCookies } from "./actions"
import { server } from "@/utils/trpc/server"
import { findActiveMembership, getMembershipTypeName, type User } from "@dotkomonline/types"
import { IconArrowNarrowLeft, IconUser, IconUserFilled } from "@tabler/icons-react"

export default async function LinkIdentityPage() {
  const session = await auth.getServerSession()

  if (!session) {
    redirect(createAuthorizeUrl({ redirectAfter: "/innstillinger/bruker/link" }))
  }

  const { secondaryUserId } = await getIdentityLinkCookies().catch(() => {
    redirect("/innstillinger/bruker")
  })

  const primaryUser = await server.user.getMe.query()
  const secondaryUser = await server.user.get.query(secondaryUserId)

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Title size="xl">Bekreft kobling av brukere</Title>
        <Text className="text-sm">
          Du er i ferd med å koble en ekstra innloggingsmetode til den eksisterende brukeren din. Brukerprofilen som
          hører til denne innloggingsmetoden blir samtidig koblet til kontoen din. Kontroller at informasjonen under
          stemmer før du fortsetter.
        </Text>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <UserColumn type="primary" user={primaryUser} />

        <div className="flex flex-col items-center gap-2 md:gap-0">
          <IconArrowNarrowLeft className="size-8 rotate-90 self-center md:rotate-0" strokeWidth={2} />
          <Text className="text-[0.55rem] font-bold">Sammenslås</Text>
        </div>

        <UserColumn type="secondary" user={secondaryUser} />
      </div>

      <Text className="text-xs text-gray-500 dark:text-stone-500">
        Denne handlingen slår sammen de to brukerene til én bruker. All data og historikk overføres til primærbruker.
        Hvis både primærbruker og sekundærbruker har verdi i samme felt, beholdes verdien til primærbruker, og verdien
        til sekundærbruker går tapt. Sammenslåingen kan ikke angres.
      </Text>

      <ConfirmIdentityLinkButton />
    </div>
  )
}

type UserColumnProps = {
  user: User
  type: "primary" | "secondary"
}

function UserColumn({ user, type }: UserColumnProps) {
  const name = user.name ?? "<Ingen navn oppgitt>"
  const email = user.email ?? "<Ingen e-post oppgitt>"

  const membership = findActiveMembership(user)
  const membershipType = membership && getMembershipTypeName(membership.type)
  const grade = membership?.semester != null ? getStudyGrade(membership.semester) : null

  const title = type === "primary" ? "Primærbruker" : "Sekundærbruker"
  const caption = type === "primary" ? "Primærbrukeren beholdes." : "Sekundærbrukeren vil bli slått sammen."

  const cardColor = cn(
    type === "primary" && "bg-violet-100 border-violet-200 dark:bg-violet-900/60 dark:border-white/10",
    type === "secondary" && "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/60 dark:border-white/10"
  )

  const titleColor = cn(
    type === "primary" && "text-violet-700 dark:text-violet-300",
    type === "secondary" && "text-yellow-700 dark:text-yellow-300"
  )

  const cardHeaderColor = cn(
    type === "primary" && "bg-violet-200 dark:bg-violet-900/75 border-violet-200 dark:border-white/10",
    type === "secondary" && "bg-yellow-200 dark:bg-yellow-900/75 border-yellow-200 dark:border-white/10"
  )

  const icon =
    type === "primary" ? (
      <IconUserFilled className={cn("size-3.5", titleColor)} />
    ) : (
      <IconUser className={cn("size-3.5", titleColor)} strokeWidth={2.5} />
    )

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex flex-col gap-1 rounded-xl border border-gray-200 bg-gray-50 dark:border-stone-700 dark:bg-stone-900",
          cardColor
        )}
      >
        <div className={cn("flex gap-2 items-center p-2 pb-1.5 rounded-t-xl", cardHeaderColor)}>
          {icon}
          <Title element="h3" size="sm" className={cn("text-sm", titleColor)}>
            {title}
          </Title>
        </div>

        <div className="flex gap-3 items-center p-3 pt-1.5">
          <Avatar className="size-12">
            <AvatarImage className="object-cover" src={user.imageUrl ?? undefined} />
            <AvatarFallback className="bg-gray-500 dark:bg-stone-500">
              <IconUser className="size-[1.5em]" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <Text className="font-medium text-sm truncate" title={name}>
              {name}
            </Text>

            <Text className="text-xs truncate" title={email}>
              {email}
            </Text>

            <Text className={cn("text-xs", membershipType === null && "text-gray-500 dark:text-stone-500")}>
              {membershipType ? `${membershipType} ${grade ? `(${grade}. klasse)` : ""}` : "Ingen medlemskap"}
            </Text>
          </div>
        </div>
      </div>

      <Text className="text-xs">{caption}</Text>
    </div>
  )
}
