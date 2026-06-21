"use client"

import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { VinstraffIcon } from "@/components/atoms/VinstraffIcon"
import { env } from "@/env"
import { type Icon, IconBuildingBank, IconBulb, IconConfetti, IconLogin2, IconSchool } from "@tabler/icons-react"
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
import type { ComponentType, FC } from "react"
import { MainNavigation } from "./MainNavigation"
import { MobileNavigation } from "./MobileNavigation"
import { ProfileMenu } from "./ProfileMenu"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"

export type MenuIcon = Icon | ComponentType<{ className?: string; width?: number; height?: number }>

export type MenuItem = {
  title: string
  href: string
  icon: MenuIcon
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
        icon: OnlineIcon,
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
        title: "Fadderukene",
        href: "/fadderukene",
        icon: IconConfetti,
        description: "Finn informasjon om Onlines fadderuker.",
      },
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
        title: "Vinstraff",
        href: "https://vinstraff.no/",
        icon: VinstraffIcon,
        description: "Er det en slask på PU-gruppa di? Gi dem en vinstraff.",
      },
      {
        title: "Grades",
        href: "https://grades.no/",
        icon: IconSchool,
        description: "Karakterstatistikk for emner ved NTNU, lagd og drevet av Linjeforeningen Online.",
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
        description: "Har du en idé til et arrangement du ønsker at linjeforeningen skal arrangere?",
      },
      {
        title: "Kvitteringskjema",
        href: "https://autobank.online.ntnu.no/",
        icon: IconReceipt,
        description: "Få refusjon for utlegg du har gjort på vegne av linjeforeningen.",
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
  const { sessionUser, isInvalid } = useAuthenticatedUser()

  const isLoggedIn = sessionUser != null && !isInvalid
  const showLoginButton = sessionUser === null

  return (
    <header className={cn("navbar-shell sticky top-4 z-50 mt-4 flex items-stretch", showLoginButton && "gap-1.5")}>
      <div
        className={cn(
          "h-(--navbar-height) rounded-[calc(var(--navbar-height)/2)] border border-blue-100 bg-blue-100/80 p-3 shadow-sm backdrop-blur-xl dark:border-stone-700/30 dark:bg-stone-800/90",
          "flex flex-row items-center justify-between w-full",
          showLoginButton ? "min-w-0 grow" : "w-full",
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

      {showLoginButton && (
        <div className="flex h-(--navbar-height) shrink-0 rounded-l-lg rounded-r-[calc(var(--navbar-height)/2)] bg-blue-100/80 shadow-sm backdrop-blur-xl dark:bg-stone-800/90">
          <Button
            element="a"
            variant="default"
            size="lg"
            className="h-full min-w-19 shrink-0 rounded-l-lg rounded-r-[calc(var(--navbar-height)/2)] py-0 pl-3 pr-4 xs:pl-6 xs:pr-8 font-medium"
            href={createAuthorizeUrl({ returnTo: fullPathname })}
            icon={<IconLogin2 className="mr-1.5 size-6" />}
          >
            <span className="hidden min-[380px]:inline">Logg inn</span>
          </Button>
        </div>
      )}
    </header>
  )
}
