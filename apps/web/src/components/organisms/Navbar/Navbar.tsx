import { auth } from "@/auth"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import Link from "next/link"
import { MainNavigation } from "./MainNavigation"
import { MobileNavigation } from "./MobileNavigation"
import { ProfileMenu } from "./ProfileMenu"
import type { MenuLink } from "./types"

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
        href: "/interest-groups",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i Online",
      },
      {
        title: "Nodekomiteer",
        href: "/nodecommittees",
        description: "Oversikt over alle nodekomiteene i Online",
      },
      {
        title: "Komiteer",
        href: "/committees",
        description: "På denne siden finner du informasjon om alle de forskjellige komiteene i online",
      },
      {
        title: "Om Linjeforeningen Online",
        href: "#",
        description: "Informasjon om Linjeforeningen",
      },
      {
        title: "Grupper tilknyttet Online",
        href: "/other-groups",
        description: "På denne siden finner du informasjon om andre grupper tilknyttet Online",
      },
    ],
  },
  {
    title: "For bedrifter",
    items: [
      {
        title: "Samarbeid med Online",
        href: "/for-bedrifter",
        description: "Utforsk linjeforeningens tilbud og ta kontakt",
      },
      {
        title: "Kvitteringskjema",
        href: "https://kvittering.online.ntnu.no/",
        description: "Online sitt Kvitteringskjema",
      },
      { title: "Faktura", href: "https://faktura.online.ntnu.no/", description: "Faktura" },
      { title: "Interesseskjema", href: "https://interesse.online.ntnu.no/", description: "Interesert?" },
    ],
  },
]

export const Navbar = async () => {
  const session = await auth.getServerSession()

  return (
    <header className="mx-auto w-full max-w-screen-xl px-2 sm:px-10">
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
}
