import React from "react"
import { Button } from "@dotkom/ui"

import { useSession, signIn, signOut } from "next-auth/react"

const Home: React.FC = () => {
  const { data: session } = useSession()
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
      Not signed in <br/>
      <Button onClick={() => signIn()}>Sign in</Button>
    </div>
  )
}

export default Home
