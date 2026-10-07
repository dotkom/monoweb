import { getServerSession } from "@/auth"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await getServerSession()

  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: "/varslinger" }))
  }

  return null
}
