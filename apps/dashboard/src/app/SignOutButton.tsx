"use client"

import { FC } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@mantine/core"

export const SignOutButton: FC = () => {
  return (
    <Button variant="outline" onClick={() => signOut()}>
      Logg ut
    </Button>
  )
}
