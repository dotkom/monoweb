"use client"

import { Button } from "@mantine/core"
import type { FC } from "react"
import { signOut } from "../auth"

export const SignOutButton: FC = () => (
  <Button variant="outline" onClick={async () => signOut()}>
    Logg ut
  </Button>
)
