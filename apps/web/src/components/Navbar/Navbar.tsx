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
        title: "Komiteer og grupper",
        href: "/komiteer",
        icon: "tabler:users",
        description: "Informasjon om de ulike komiteene og gruppene i Online",
      },
      {
        title: "Interessegrupper",
        href: "/interessegrupper",
        icon: "tabler:users",
        description: "Er du medlem av en interessegruppe? Sjekk de ut her!",
      },
      {
        title: "Om Linjeforeningen",
        href: "/om-linjeforeningen",
        icon: "tabler:bolt",
        description: "Informasjon om linjeforeningen Online.",
      },
      {
        title: "Wiki",
        href: "https://wiki.online.ntnu.no/",
        icon: "tabler:books",
        description: "Onlines Wiki, brukt av hele Trondheim",
      },
    ],
  },
  {
    title: "For studenter",
    items: [
      {
        title: "Offline",
        href: "/offline",
        icon: "tabler:news",
        description: "Onlines egne tidsskrift",
      },
      {
        title: "Artikler",
        href: "/artikler",
        icon: "tabler:article",
        description: "Artikler skrevet for og av studenter",
      },
      {
        title: "Kvitteringskjema",
        href: "https://kvittering.online.ntnu.no/",
        icon: "tabler:receipt",
        description: "Har du lagt ut noe for linjeforeningen? Få refusjon her",
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
        description: "Send inn fakturainformasjon for din bedrift med fakturaskjemaet vårt",
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
    <header className="sticky bg-blue-100/80 dark:bg-stone-800/90 backdrop-blur-xl border border-blue-100 dark:border-stone-700/30 shadow-sm top-4 z-50 flex flex-row justify-between items-center w-full max-w-screen-xl mt-8 p-3 rounded-full">
      <Link href={env.NEXT_PUBLIC_HOME_URL}>
        <OnlineIcon className="h-10 w-10" />
      </Link>

      <MainNavigation links={links} />

      <div className="ml-auto flex items-center">
        <ProfileMenu />
        <MobileNavigation links={links} />
      </div>
    </header>
  )
}
