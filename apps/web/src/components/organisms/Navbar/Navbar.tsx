import Link from "next/link"
import React from "react"
import OnlineIcon from "@/components/atoms/OnlineIcon"
import { MainNavigation } from "./MainNavigation"
import { MobileNavigation } from "./MobileNavigation"
import { ProfileMenu } from "./ProfileMenu"
import { type MenuLink } from "./types"

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
      { title: "Kontakt", href: "/company-info", description: "Kontakt Linjeforening" },
      { title: "Kvitteringskjema", href: "/company-info", description: "Online sitt Kvitteringskjema" },
      { title: "Faktura", href: "/company-info", description: "Faktura" },
      { title: "Interesseskjema", href: "/company-info", description: "Interesert?" },
    ],
  },
]

export const Navbar = () => (
  <header className="mx-auto w-full max-w-screen-xl px-4 sm:px-9">
    <div className="border-blue-12/20 flex h-16 border-b">
      <MobileNavigation links={links} />
      <Link href="/" className="flex items-center">
        <OnlineIcon className="fill-brand h-[24px] dark:fill-white" />
      </Link>
      <MainNavigation links={links} />
      <div className="flex flex-grow items-center justify-end md:flex-grow-0">
        <ProfileMenu />
      </div>
    </div>
  </header>
)
