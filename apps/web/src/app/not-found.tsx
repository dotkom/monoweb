import { auth } from "@/auth"
import { NotFoundDefault } from "@/components/not-found/default-view"
import { NotFoundGameView } from "@/components/not-found/game-view"

export default async function NotFound() {
  const session = await auth.getServerSession()

  if (session) {
    return <NotFoundGameView />
  }

  return <NotFoundDefault />
}
