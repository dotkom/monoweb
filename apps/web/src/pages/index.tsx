import React from "react"
import { useSession as _useSession } from "next-auth/react"
import { trpc } from "@/utils/trpc"

export interface Session {
  isLoading: boolean
  user: {
    id: string
    email: string
    name: string
    image?: string
    studyYear: number
  } | null
}

export const useSession = (): Session => {
  const { data: session, status } = _useSession()

  const { data, isLoading: dbCallLoading } = trpc.user.get.useQuery(session?.user.id ?? "", {
    enabled: Boolean(session?.user.id),
  })

  if(!data?.studyYear || !session?.user) {
    return {
      isLoading: dbCallLoading || status === "loading",
      user: null
    }
  }

  return {
    isLoading: dbCallLoading,
    user: { studyYear: data.studyYear, ...session.user }
  }
}

const Home: React.FC = () => {
  const auth = useSession()
  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  )
}

export default Home
