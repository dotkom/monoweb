import { Button } from "@dotkomonline/ui"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import React from "react"
import { useTheme } from "next-themes"

const Home: React.FC = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setTheme } = useTheme()
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
      <Button onClick={() => signIn("onlineweb")}>Login</Button>
      <Button onClick={() => router.push("/auth/signup")}>Sign up</Button>
      <Button onClick={() => setTheme("dark")}>Make it dark</Button>
      <Button onClick={() => setTheme("light")}>Make it light</Button>
    </div>
  )
}

export default Home
