import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { env } from "@/env"
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
    href: "/arrangementer",
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
      {
        title: "Offline",
        href: "/offline",
        description: "Online sitt eget tidsskrift.",
      },
      {
        title: "Artikler",
        href: "/artikler",
        description: "Artikler skrevet av studenter.",
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
    <header className="flex flex-row items-center w-full max-w-screen-xl mt-8 p-3 rounded-2xl bg-blue-50 dark:bg-stone-900">
      <MobileNavigation links={links} />

      <Link href={env.NEXT_PUBLIC_HOME_URL} className="hidden lg:ml-2 lg:block">
        <OnlineIcon className="h-8 w-8" />
      </Link>

      <MainNavigation links={links} />

      <ProfileMenu />
    </header>
  )
}
