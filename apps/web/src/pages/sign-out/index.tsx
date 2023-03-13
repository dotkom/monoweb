import { useClerk } from "@clerk/nextjs"
import { useEffect } from "react"

export default function SignOutPage() {
  const { session, signOut } = useClerk()
  useEffect(() => {
    signOut()
  }, [signOut])

  return <div>{session ? <div>Signing out...</div> : <div>You have been signed out</div>}</div>
}
