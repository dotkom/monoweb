"use client"

import { OnlineIcon } from "@dotkomonline/ui"
import { Tabs, TabsList } from "@dotkomonline/ui/src/components/Tabs"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

export default function NavBar() {
  const session = useSession()

  return (
    <div className="h-20 px-20 w-full bg-transparent flex justify-between items-center ">
      <div className="">
        <Link href={"/"}>
          <OnlineIcon className="w-28" />
        </Link>
      </div>
      <Tabs className="">
        {session.status !== "authenticated" ? (
          <TabsList
            onClick={() => signIn("auth0")}
            className="bg-[#FFF] border border-slate-8 hover:bg-slate-4 font-bold  px-6 py-2 cursor-pointer"
          >
            <div>Sign in</div>
          </TabsList>
        ) : (
          <TabsList>
            <button
              type="button"
              onClick={() => signOut()}
              className="bg-[#FFF] border border-slate-8 hover:bg-slate-4 font-bold  px-6 py-2 cursor-pointer"
            >
              Log out
            </button>
          </TabsList>
        )}
      </Tabs>
    </div>
  )
}
