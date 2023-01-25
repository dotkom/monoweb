import { Button } from "@dotkomonline/ui"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import React from "react"

const Home: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  if (session) {
    return (
      <div>
        {status}
        {JSON.stringify(session)}
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>
    )
  }

  return (
    <div className="">
      Not signed in <br />
      <Button onClick={() => signIn("onlineweb")}>Login</Button>
      <Button onClick={() => router.push("/auth/signup")}>Sign up</Button>
    </div>
  )
}

export default Home
