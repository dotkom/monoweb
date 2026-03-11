import { auth } from "@/auth"
import { NotFoundDefault } from "@/components/not-found/default-view"
import { NotFoundSimple } from "@/components/not-found/simple-view"

export default async function NotFound() {
  const session = await auth.getServerSession()

  if (session) {
    return <NotFoundDefault />
  }

  return <NotFoundSimple />
}
