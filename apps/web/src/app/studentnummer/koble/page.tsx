import { getServerSession } from "@/auth"
import { server } from "@/utils/trpc/server"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { Text, Title } from "@dotkomonline/ui"
import { redirect } from "next/navigation"

interface LinkStudentNumberPageProps {
  searchParams: Promise<{
    userRfid?: string
    expires?: string
    signature?: string
  }>
}

export default async function LinkStudentNumberPage({ searchParams }: LinkStudentNumberPageProps) {
  const { userRfid, expires, signature } = await searchParams
  const returnTo = `/studentnummer/koble?${new URLSearchParams({
    userRfid: userRfid ?? "",
    expires: expires ?? "",
    signature: signature ?? "",
  })}`

  if (!(await getServerSession())) {
    redirect(createAuthorizeUrl({ returnTo }))
  }

  if (!userRfid || !expires || !signature) {
    return <LinkError message="Lenken mangler nødvendig informasjon." />
  }

  let user: Awaited<ReturnType<typeof server.officeCheckins.linkUser.mutate>>
  try {
    user = await server.officeCheckins.linkUser.mutate({
      userRfid,
      expires: Number(expires),
      signature,
    })
  } catch (error) {
    console.error("[web:student-number-link] failed to link student number", error)
    return (
      <LinkError message="Lenken er ugyldig, utløpt eller studentnummeret er allerede koblet til en annen bruker." />
    )
  }

  redirect(`/profil/${encodeURIComponent(user.username)}?studentnummer=koblet`)
}

function LinkError({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Title size="xl">Kunne ikke koble studentnummer</Title>
      <Text>{message}</Text>
    </div>
  )
}
