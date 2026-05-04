"use client"

import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { env } from "@/env"
import { type Icon, IconBuildingBank, IconBulb, IconCrown, IconLogin2 } from "@tabler/icons-react"
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
import { useUser } from "@auth0/nextjs-auth0/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"

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
        title: "Om Linjeforeningen",
        href: "/om-linjeforeningen",
        icon: IconBolt,
        description: "Er du nysgjerrig på hva linjeforeningen Online egentlig er? Da er dette et godt sted å starte.",
      },
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
        title: "Hovedstyret",
        href: "/grupper/hs",
        icon: IconCrown,
        description: "Hovedstyret er linjeforeningens ansikt utad og står for daglig drift av linjeforeningen.",
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
        title: "Foreslå arrangement",
        href: "https://docs.google.com/forms/d/e/1FAIpQLScbveu4vu-3JmZImLtfytnQKxCKfocwlcuUwuTOwssDUpt0_Q/viewform",
        icon: IconBulb,
        description: "Har du et ønske om et arrangement? Foreslå det her.",
      },
      {
        title: "Kvitteringskjema",
        href: "https://autobank.online.ntnu.no/",
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
        title: "Interesseskjema",
        href: "/bedrift/interesse",
        icon: IconMessage,
        description: "Interessert i å vise bedriften din for studentene våre? Meld interesse!",
      },
      {
        title: "Fakturaskjema",
        href: "/bedrift/faktura",
        icon: IconReceipt,
        description: "Send inn fakturainformasjon for din bedrift med fakturaskjemaet vårt.",
      },
    ],
  },
]

export const Navbar: FC = () => {
  const fullPathname = useFullPathname()
  const { user } = useUser()

  const isLoggedIn = user != null

  return (
    <header className="sticky top-4 z-50 grid grid-cols-[1fr_auto] gap-1.5 items-center w-full max-w-7xl mt-4">
      <div
        className={cn(
          // i have no idea why i need rounded-r-4xl and not rounded-r-full
          "p-3 rounded-4xl bg-blue-100/80 dark:bg-stone-800/90 backdrop-blur-xl shadow-sm border border-blue-100 dark:border-stone-700/30",
          "flex flex-row justify-between items-center w-full",
          !isLoggedIn && "rounded-r-lg"
        )}
      >
        <Link href={env.NEXT_PUBLIC_HOME_URL} className="shrink-0">
          <OnlineIcon className="size-10 shrink-0" />
        </Link>

        <MainNavigation links={links} />

        <div className="ml-auto flex items-center">
          <ProfileMenu />
          <MobileNavigation links={links} />
        </div>
      </div>

      {!isLoggedIn && (
        <div className="h-full rounded-l-lg rounded-r-4xl bg-blue-100/80 dark:bg-stone-800/90 backdrop-blur-xl shadow-sm">
          <Button
            element={Link}
            variant="solid"
            color="brand"
            className="font-medium min-w-19 pl-3 pr-4 xs:pl-6 xs:pr-8 py-4 rounded-l-lg rounded-r-4xl shrink-0 h-full"
            href={createAuthorizeUrl({ redirectAfter: fullPathname })}
            prefetch={false}
            icon={<IconLogin2 className="mr-1.5 size-6" />}
          >
            <span className="hidden min-[380px]:inline">Logg inn</span>
          </Button>
        </div>
      )}
    </header>
  )
}
