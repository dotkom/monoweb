import React from "react"
import { useSession } from "next-auth/react"
import { trpc } from "@/utils/trpc"

export const useSessionWithDBUser = () => {
  const { data: session, status } = useSession()
  const { data, isLoading } = trpc.user.get.useQuery(session?.user.id ?? "", {
    enabled: Boolean(session?.user.id),
  })

  return {
    isLoading: isLoading || status === "loading",
    user: {
      ...data,
      id: session?.user.id,
      email: session?.user.email,
      name: session?.user.name,
      image: session?.user.image,
    },
  }
}

const Home: React.FC = () => {
  const auth = useSessionWithDBUser()
  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  )
}

export default Home
