"use client"

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react"

export default function Home() {
  const session = useSession()

  return (
    <SessionProvider>
      <div>
        <main>Hello world</main>
        <button onClick={() => signIn("onlineweb")}>sign in</button>
        <button onClick={() => signOut()}>sign out</button>
        <p>{session?.data?.user && JSON.stringify(session.data.user)}</p>
      </div>
    </SessionProvider>
  )
}
