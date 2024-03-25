'use client'
import { Tabs, TabsContent, TabsList } from "@dotkomonline/ui/src/components/Tabs"
import Link from "next/link"

export default function NavBar() {
  return <div className="h-8 px-20 w-full flex justify-between">
    <div className="h-full">
      <Link href={""}>LOGO</Link>
    </div>
    <Tabs className={"flex gap-4"}>
      <Link href={""}>login</Link>
      <Link href={""}>logout</Link>
    </Tabs>
  </div>
}