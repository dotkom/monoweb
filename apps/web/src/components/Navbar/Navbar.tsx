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
  icon: string
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
    icon: "tabler:calendar-event",
  },
  {
    title: "Jobbannonser",
    href: "/karriere",
    icon: "tabler:briefcase",
  },
  {
    title: "Om oss",
    items: [
      {
        title: "Komiteer",
        href: "/komiteer",
        icon: "tabler:users",
        description: "På denne siden finner du informasjon om alle de forskjellige komiteene i online.",
      },
      {
        title: "Nodekomiteer",
        href: "/nodekomiteer",
        icon: "tabler:users",
        description: "Oversikt over alle nodekomiteene i Online.",
      },
      {
        title: "Interessegrupper",
        href: "/interessegrupper",
        icon: "tabler:users",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i Online.",
      },
      {
        title: "Grupper tilknyttet Online",
        icon: "tabler:users",
        href: "/andre-grupper",
        description: "På denne siden finner du informasjon om andre grupper tilknyttet Online.",
      },
      {
        title: "Om Linjeforeningen Online",
        href: "/om-linjeforeningen",
        icon: "tabler:info-circle",
        description: "Informasjon om Linjeforeningen.",
      },
    ],
  },
  {
    title: "For studenter",
    items: [
      {
        title: "Wiki",
        href: "https://wiki.online.ntnu.no/",
        icon: "tabler:books",
        description: "Online sin åpne wiki.",
      },
      {
        title: "Offline",
        href: "/offline",
        icon: "tabler:news",
        description: "Online sitt eget tidsskrift.",
      },
      {
        title: "Artikler",
        href: "/artikler",
        icon: "tabler:article",
        description: "Artikler skrevet av studenter.",
      },
      {
        title: "Kvitteringskjema",
        href: "https://kvittering.online.ntnu.no/",
        icon: "tabler:receipt",
        description: "Har du lagt ut noe for linjeforeningen? Få refusjon via kvitteringskjemaet vårt.",
      },
    ],
  },
  {
    title: "For bedrifter",
    items: [
      {
        title: "Samarbeid med Online",
        href: "/for-bedrifter",
        icon: "tabler:heart-handshake",
        description: "Utforsk linjeforeningens tilbud og ta kontakt",
      },
      {
        title: "Fakturaskjema",
        href: "https://faktura.online.ntnu.no/",
        icon: "tabler:receipt",
        description: "Send inn fakturainformasjon for din bedrift med fakturaskjemaet vårt.",
      },
      {
        title: "Interesseskjema",
        href: "https://interesse.online.ntnu.no/",
        icon: "tabler:message",
        description: "Interessert i å vise bedriften din for studentene våre? Meld interesse!",
      },
    ],
  },
]

export const Navbar: FC = () => {
  return (
    <header className="flex flex-row items-center w-full max-w-screen-xl mt-8 p-3 rounded-2xl bg-blue-50 dark:bg-stone-900">
      <MobileNavigation links={links} />

      <Link href={env.NEXT_PUBLIC_HOME_URL} className="hidden lg:ml-2 md:block">
        <OnlineIcon className="h-8 w-8" />
      </Link>

      <MainNavigation links={links} />

      <ProfileMenu />
    </header>
  )
}
