"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function Home() {
  const session = useSession()

  return (
    <div>
      <main>Hello world</main>
      <button onClick={() => signIn("onlineweb")}>sign in</button>
      <button onClick={() => signOut()}>sign out</button>
      <p>{session?.data?.user ? JSON.stringify(session.data.user) : "No logged in user"}</p>
    </div>
  )
}
