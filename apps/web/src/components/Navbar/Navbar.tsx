"use client"

import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { env } from "@/env"
import { type Icon, IconBuildingBank } from "@tabler/icons-react"
import {
  IconArticle,
  IconBolt,
  IconBook2,
  IconBriefcase,
  IconCalendarEvent,
  IconHeartHandshake,
  IconMessage,
  IconNews,
  IconReceipt,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"
import type { FC } from "react"
import { MainNavigation } from "./MainNavigation"
import { MobileNavigation } from "./MobileNavigation"
import { ProfileMenu } from "./ProfileMenu"

export type MenuItem = {
  title: string
  href: string
  icon: Icon
  description?: string
  highlighted?: boolean
}

export type MenuLink =
  | MenuItem
  | {
      title: string
      icon?: Icon
      items: MenuItem[]
      highlighted?: false // renderes a card on mobile menu
    }

const links: MenuLink[] = [
  {
    title: "Arrangementer",
    href: "/arrangementer",
    icon: IconCalendarEvent,
    highlighted: true,
  },
  {
    title: "Jobbannonser",
    href: "/karriere",
    icon: IconBriefcase,
    highlighted: true,
  },
  {
    title: "Om oss",
    items: [
      {
        title: "Komiteer og grupper",
        href: "/grupper",
        icon: IconUsers,
        description: "Informasjon om de ulike komiteene og gruppene i Online.",
      },
      {
        title: "Interessegrupper",
        href: "/interessegrupper",
        icon: IconUsers,
        description: "Er du medlem av en interessegruppe? Sjekk de ut her!",
      },
      {
        title: "Om Linjeforeningen",
        href: "/om-linjeforeningen",
        icon: IconBolt,
        description: "Informasjon om linjeforeningen Online.",
      },
      {
        title: "Wiki",
        href: "https://wiki.online.ntnu.no/",
        icon: IconBook2,
        description: "Onlines wiki, brukt av hele Trondheim.",
      },
    ],
  },
  {
    title: "For studenter",
    items: [
      {
        title: "Offline",
        href: "/offline",
        icon: IconNews,
        description: "Onlines egne tidsskrift.",
      },
      {
        title: "Artikler",
        href: "/artikler",
        icon: IconArticle,
        description: "Artikler skrevet for og av studenter.",
      },
      {
        title: "Onlinefondet",
        href: "https://onlinefondet.no",
        icon: IconBuildingBank,
        description: "Søk om økonomisk støtte fra Onlines egne fond.",
      },
      {
        title: "Kvitteringskjema",
        href: "https://kvittering.online.ntnu.no/",
        icon: IconReceipt,
        description: "Har du lagt ut noe for linjeforeningen? Få refusjon her.",
      },
    ],
  },
  {
    title: "For bedrifter",
    items: [
      {
        title: "Samarbeid med Online",
        href: "/for-bedrifter",
        icon: IconHeartHandshake,
        description: "Utforsk linjeforeningens tilbud og ta kontakt.",
      },
      {
        title: "Fakturaskjema",
        href: "https://faktura.online.ntnu.no/",
        icon: IconReceipt,
        description: "Send inn fakturainformasjon for din bedrift med fakturaskjemaet vårt.",
      },
      {
        title: "Interesseskjema",
        href: "https://interesse.online.ntnu.no/",
        icon: IconMessage,
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
