"use client"

import { FC } from "react"
import { signIn } from "next-auth/react"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { Button } from "@radix-ui/themes"

export const SignInButton: FC = () => {
  return (
    <Button className="mt-8" onClick={() => signIn("cognito")}>
      Logg inn via Monoweb
      <ArrowRightIcon width="16" height="16" />
    </Button>
  )
}
