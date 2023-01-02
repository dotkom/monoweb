import { Button } from "@dotkomonline/ui"
import { useSession, signIn, signOut } from "next-auth/react"
import React from "react"

const Home: React.FC = () => {
  const { data: session, status } = useSession()
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
    <div>
      Not signed in <br />
      <Button onClick={() => signIn("onlineweb")}>Sign in</Button>
    </div>
  )
}

export default Home
