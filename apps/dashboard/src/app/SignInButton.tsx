"use client";

import { Button } from "@mantine/core";
import { signIn } from "next-auth/react";
import { type FC } from "react";

export const SignInButton: FC = () => (
  <Button className="mt-8" onClick={async () => signIn("cognito")}>
    Logg inn via Monoweb
  </Button>
);
