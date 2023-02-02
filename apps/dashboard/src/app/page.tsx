"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button, Text } from "@dotkomonline/ui"

export default function Home() {
  const session = useSession()

  return (
    <div>
      <Text>Hello world</Text>
      <Button onClick={() => signIn("onlineweb")}>sign in</Button>
      <Button onClick={() => signOut()}>sign out</Button>
      <Text>{session?.data?.user ? JSON.stringify(session.data.user) : "No logged in user"}</Text>
    </div>
  )
}
