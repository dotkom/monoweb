"use client"

import { type FC } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@mantine/core"

export const SignInButton: FC = () => (
  <Button className="mt-8" onClick={async () => signIn("cognito")}>
    Logg inn via Monoweb
  </Button>
)
