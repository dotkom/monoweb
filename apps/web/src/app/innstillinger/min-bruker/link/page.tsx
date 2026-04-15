"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { confirmIdentityLinkAction } from "./actions"
import { Text } from "@dotkomonline/ui"

export default function LinkIdentityPage() {
  const router = useRouter()

  useEffect(() => {
    confirmIdentityLinkAction()
      .then(() => {
        router.replace("/innstillinger/profil")
      })
      .catch((error) => {
        console.error("Failed to link identity:", error)
        router.replace("/innstillinger/profil?error=link_failed")
      })
  }, [router])

  return <Text>Kobler sammen kontoer...</Text>
}
