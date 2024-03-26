"use client"

import { OnlineIcon } from "@dotkomonline/ui"
import { Tabs, TabsList } from "@dotkomonline/ui/src/components/Tabs"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

export default function NavBar() {
  const session = useSession()

  return (
    <div className="h-20 px-20 w-full flex justify-between items-center ">
      <div className="">
        <Link href={""}>
          <OnlineIcon className="w-28" />
        </Link>
      </div>
      <Tabs className={"flex gap-4"}>
        {session.status !== "authenticated" ? (
          <TabsList>
            <button type="button" onClick={() => signIn("auth0")}>
              Sign in
            </button>
          </TabsList>
        ) : (
          <TabsList>
            <button type="button" onClick={() => signOut()}>
              Log out
            </button>
          </TabsList>
        )}
      </Tabs>
    </div>
  )
}
