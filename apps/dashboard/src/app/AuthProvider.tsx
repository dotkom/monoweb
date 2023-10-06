"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type PropsWithChildren } from "react";

export type AuthProviderProps = PropsWithChildren & {
  session?: Session;
};

export const AuthProvider = ({ children, session }: AuthProviderProps) => (
  <SessionProvider session={session}>{children}</SessionProvider>
);
