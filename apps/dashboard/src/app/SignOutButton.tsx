"use client";

import { Button } from "@mantine/core";
import { signOut } from "next-auth/react";
import { type FC } from "react";

export const SignOutButton: FC = () => (
  <Button onClick={async () => signOut()} variant="outline">
    Logg ut
  </Button>
);
