import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import Link from "next/link"
import type { FC } from "react"
import { MainNavigation } from "./MainNavigation"
import { MobileNavigation } from "./MobileNavigation"
import { ProfileMenu } from "./ProfileMenu"

export type MenuItem = {
  title: string
  href: string
  description?: string
}

export type MenuLink =
  | MenuItem
  | {
      title: string
      items: MenuItem[]
    }

const links: MenuLink[] = [
  {
    title: "Arrangementer",
    href: "/events",
  },
  {
    title: "Jobbannonser",
    href: "/karriere",
  },
  {
    title: "Om oss",
    items: [
      {
        title: "Komiteer",
        href: "/komiteer",
        description: "På denne siden finner du informasjon om alle de forskjellige komiteene i online.",
      },
      {
        title: "Nodekomiteer",
        href: "/nodekomiteer",
        description: "Oversikt over alle nodekomiteene i Online.",
      },
      {
        title: "Interessegrupper",
        href: "/interessegrupper",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i Online.",
      },
      {
        title: "Om Linjeforeningen Online",
        href: "/om-linjeforeningen",
        description: "Informasjon om Linjeforeningen.",
      },
      {
        title: "Grupper tilknyttet Online",
        href: "/andre-grupper",
        description: "På denne siden finner du informasjon om andre grupper tilknyttet Online.",
      },
    ],
  },
  {
    title: "For studenter",
    items: [
      {
        title: "Kvitteringskjema",
        href: "https://kvittering.online.ntnu.no/",
        description: "Har du lagt ut noe for linjeforeningen? Få refusjon via kvitteringskjemaet vårt.",
      },
      {
        title: "Wiki",
        href: "https://wiki.online.ntnu.no/",
        description: "Online sin åpne wiki.",
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
        title: "Fakturaskjema",
        href: "https://faktura.online.ntnu.no/",
        description: "Send inn fakturainformasjon for din bedrift med fakturaskjemaet vårt.",
      },
      {
        title: "Interesseskjema",
        href: "https://interesse.online.ntnu.no/",
        description: "Interessert i å vise bedriften din for studentene våre? Meld interesse!",
      },
    ],
  },
]

export const Navbar: FC = () => {
  return (
    <header className="px-4 lg:px-10 mt-4">
      <div className="flex flex-row w-full max-w-screen-xl px-6 py-3 rounded-2xl bg-blue-2">
        <MobileNavigation links={links} />
        <Link href="/" className="hidden lg:flex items-center">
          <OnlineIcon className="h-[2.5rem]" />
        </Link>
        <MainNavigation links={links} />
        <div className="flex flex-grow items-center justify-end md:flex-grow-0">
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}
