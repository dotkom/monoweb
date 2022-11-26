import { env } from "@/env/env"
import { Button } from "@dotkomonline/ui"
import { useSession, signIn, signOut } from "next-auth/react"
import React from "react"

const Home: React.FC = () => {
  const { data: session } = useSession()
  console.log(env)
  if (session) {
    return (
      <div>
        Signed in as {session.user?.email} <br />
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>
    )
  }

  return (
    <div>
      Not signed in <br />
      <Button onClick={() => signIn("onlineweb")}>Sign in</Button>
    </div>
  )
}

export default Home
