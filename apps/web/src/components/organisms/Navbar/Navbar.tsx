import OnlineIcon from "@/components/atoms/OnlineIcon"
import { Button, cn, Icon } from "@dotkomonline/ui"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { FC, useEffect } from "react"
import { MainNavigation } from "./MainNavigation"
import { MobileNavigation } from "./MobileNavigation"
import { navigationMenuTriggerStyle } from "./NavigationMenu"
import { MenuLink } from "./types"

const links: MenuLink[] = [
  {
    title: "Arrangementer",
    href: "/events",
  },
  {
    title: "Karriere",
    href: "/career",
  },
  {
    title: "Om oss",
    items: [
      {
        title: "Interessegrupper",
        href: "#",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i online",
      },
      {
        title: "Om Linjeforeningen Online",
        href: "#",
        description: "Informasjon om Linjeforeningen",
      },
    ],
  },
  {
    title: "For bedrifter",
    items: [
      { title: "Kontakt", href: "/company", description: "Kontakt Linjeforening" },
      { title: "Kvitteringskjema", href: "/company", description: "Online sitt Kvitteringskjema" },
      { title: "Faktura", href: "/company", description: "Faktura" },
      { title: "Interesseskjema", href: "/company", description: "Interesert?" },
    ],
  },
]

export const Navbar = () => {
  const router = useRouter()
  return (
    <header className="mx-auto w-full max-w-screen-xl px-4 sm:px-9">
      <div className="border-blue-12/20 flex h-16 border-b">
        <MobileNavigation links={links} />
        <Link href="/" className="flex items-center">
          <OnlineIcon className="fill-brand h-[24px] dark:fill-white" />
        </Link>
        <MainNavigation links={links} />
        <div className="flex flex-grow items-center justify-end md:flex-grow-0">
          <Button
            variant="subtle"
            className={cn(navigationMenuTriggerStyle(), "hover:translate-y-0 active:translate-y-0")}
            onClick={() => signIn("onlineweb")}
          >
            Log in
          </Button>
          <Button
            variant="gradient"
            className={cn(navigationMenuTriggerStyle(), "ml-3 hover:translate-y-0 active:translate-y-0")}
            onClick={() => router.push("/auth/signup")}
          >
            Sign up
          </Button>
        </div>
      </div>
    </header>
  )
}
