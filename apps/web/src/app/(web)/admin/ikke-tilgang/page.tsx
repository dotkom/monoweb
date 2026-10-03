import { Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { getServerSession } from "@dashboard/lib/auth"
import { getServerAuthorization } from "@dashboard/lib/server-authorization"
import { IconShieldLock } from "@tabler/icons-react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Ingen tilgang til adminsider | OnlineWeb",
}

export default async function UnauthorizedPage() {
  const session = await getServerSession()

  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: "/admin" }))
  }

  const { isCommitteeMember } = await getServerAuthorization()

  if (isCommitteeMember) {
    redirect("/admin")
  }

  return (
    <div className="flex sm:min-h-[55vh] flex-col items-center justify-center w-full">
      <div className="flex flex-col gap-6 max-w-lg">
        <div className="w-fit rounded-full bg-muted p-2.5 sm:p-3 text-muted-foreground">
          <IconShieldLock className="size-10 sm:size-12" aria-hidden="true" />
        </div>
        <Title element="h1" className="text-xl sm:text-2xl">
          Du har ikke tilgang til OnlineWebs adminsider.
        </Title>
        <Text className="max-w-lg text-muted-foreground">Er dette feil, må du ta kontakt med din komitéleder.</Text>
      </div>
    </div>
  )
}
