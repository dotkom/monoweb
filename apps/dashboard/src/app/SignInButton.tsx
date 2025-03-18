"use client"

import { Button } from "@mantine/core"
import type { FC } from "react"
import { signIn } from "../auth"

export const SignInButton: FC = () => (
  <Button className="mt-8" onClick={async () => signIn("auth0")}>
    Logg inn via Monoweb
  </Button>
)
