"use client"
import { OnlineIcon } from "@dotkomonline/ui"
import { Tabs, TabsContent, TabsList } from "@dotkomonline/ui/src/components/Tabs"
import Link from "next/link"

export default function NavBar() {
  return (
    <div className="h-20 px-20 w-full flex justify-between items-center ">
      <div className="">
        <Link href={""}>
          <OnlineIcon className="w-28" />
        </Link>
      </div>
      <Tabs className={"flex gap-4"}>
        <Link href={""}>login</Link>
        <Link href={""}>logout</Link>
      </Tabs>
    </div>
  )
}
