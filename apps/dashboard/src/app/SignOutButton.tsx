"use client"

import { FC } from "react"
import { signOut } from "next-auth/react"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { Button } from "@radix-ui/themes"

export const SignOutButton: FC = () => {
  return (
    <Button variant="outline" onClick={() => signOut()}>
      Logg ut
      <ArrowRightIcon width="16" height="16" />
    </Button>
  )
}
