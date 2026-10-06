"use client"

import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { VinstraffIcon } from "@/components/atoms/VinstraffIcon"
import { env } from "@/env"
import type { AuthState } from "@/utils/authenticated-user-state"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useFeideLinkNudge } from "@/utils/use-feide-link-nudge"
import { useFullPathname } from "@/utils/use-full-pathname"
import { Button, cn, Stripes, Text } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import {
  type Icon,
  IconArrowUpRight,
  IconArticle,
  IconBolt,
  IconBook2,
  IconBriefcase,
  IconBuildingBank,
  IconBulb,
  IconCalendarEvent,
  IconConfetti,
  IconHeartHandshake,
  IconLogin2,
  IconMessage,
  IconNews,
  IconReceipt,
  IconSchool,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"
import { type ComponentType, type FC, useRef } from "react"
import { MainNavigation } from "./MainNavigation"
import { MobileNavigation } from "./MobileNavigation"
import { NavbarDropdownAnchorContext } from "./NavbarDropdownContent"
import { ProfileMenu } from "./ProfileMenu"

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
    title: "Interessegrupper",
    href: "/interessegrupper",
    icon: IconUsers,
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

interface Props {
  initialAuthState?: AuthState
}

export const NavbarContent: FC<Props> = ({ initialAuthState }) => {
  const fullPathname = useFullPathname()
  const navbarPillRef = useRef<HTMLDivElement>(null)

  // Use initial auth state from the server, but respond to client-side changes
  const authState = useAuthenticatedUser(initialAuthState)

  const showLoginButton = !authState.isLoading && authState.sessionUser === null && !authState.isInvalid

  const { showNudge } = useFeideLinkNudge()
  const isIdentityLinkPage = fullPathname.split("?")[0] === "/innstillinger/bruker/link"
  const showDuplicateAccountStrip = showNudge && !isIdentityLinkPage

  return (
    <header className="sticky top-4 z-50 mt-4 flex flex-col gap-0.75">
      <div className={cn("navbar-shell flex items-stretch gap-2", showLoginButton && "lg:gap-1.5")}>
        <div
          ref={navbarPillRef}
          className={cn(
            "min-w-0 w-full grow h-(--navbar-height)",
            "bg-gray-100/80 dark:bg-stone-800/90 border border-gray-200 dark:border-stone-700/30",
            "flex flex-row items-center justify-between",
            "backdrop-blur-xl shadow-sm",
            "p-3 rounded-[calc(var(--navbar-height)/2)]",
            showLoginButton && "min-[1100px]:rounded-r-md"
          )}
        >
          <Link href={env.NEXT_PUBLIC_HOME_URL} className="shrink-0">
            <OnlineIcon className="size-10 shrink-0" />
          </Link>

          <MainNavigation links={links} />

          <div className="ml-auto flex items-center">
            <NavbarDropdownAnchorContext value={navbarPillRef}>
              <ProfileMenu authState={authState} />
            </NavbarDropdownAnchorContext>
          </div>
        </div>

        {showLoginButton && (
          <div
            className={cn(
              "flex h-(--navbar-height) shrink-0",
              "rounded-[calc(var(--navbar-height)/2)] lg:rounded-l-md shadow-sm"
            )}
          >
            <Button
              element="a"
              variant="default"
              color="brand"
              size="lg"
              className={cn(
                "h-full w-(--navbar-height) xs:w-auto shrink-0",
                "p-0 xs:pl-6 xs:pr-8",
                "font-medium",
                "rounded-[calc(var(--navbar-height)/2)] min-[1100px]:rounded-l-md"
              )}
              href={createAuthorizeUrl({ returnTo: fullPathname })}
              aria-label="Logg inn"
              icon={<IconLogin2 className="size-6 -ml-px xs:mr-1.5" />}
            >
              <span className="hidden xs:inline">Logg inn</span>
            </Button>
          </div>
        )}

        <div
          className={cn(
            "lg:hidden size-(--navbar-height) shrink-0",
            "flex items-center justify-center rounded-full",
            "shadow-xs backdrop-blur-xl",
            "bg-gray-100/80 dark:bg-stone-800/90 border border-gray-300/70 dark:border-stone-700/30"
          )}
        >
          <MobileNavigation links={links} />
        </div>
      </div>

      {showDuplicateAccountStrip && (
        <Link
          href="/innstillinger/bruker"
          className="flex items-center justify-center h-6 rounded-t-xs rounded-b-lg bg-red-500 dark:bg-red-600"
        >
          <Stripes
            colorA="bg-red-500 dark:bg-red-600"
            colorB="bg-white/15 dark:bg-white/20"
            animated
            speed="3s"
            className="rounded-t-xs rounded-b-lg h-full"
            childrenContainerClassName="flex gap-1 items-center justify-center h-full"
          >
            <Text element="span" className="text-sm font-medium text-white">
              Vi tror du har to kontoer. Trykk her for å koble dem sammen
            </Text>

            <IconArrowUpRight className="size-4 rounded-sm text-white" />
          </Stripes>
        </Link>
      )}
    </header>
  )
}
