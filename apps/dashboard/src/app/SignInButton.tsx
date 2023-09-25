"use client"

import { FC } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@mantine/core"

export const SignInButton: FC = () => {
  return (
    <Button className="mt-8" onClick={() => signIn("cognito")}>
      Logg inn via Monoweb
    </Button>
  )
}
