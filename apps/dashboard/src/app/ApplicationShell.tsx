"use client"

import { Icon } from "@iconify/react"
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Flex,
  Group,
  NavLink,
  Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useState, type FC, type PropsWithChildren } from "react"
import { SignOutButton } from "./SignOutButton"

const navigations = [
  {
    label: "Arrangementer",
    icon: "tabler:wheelchair",
    children: [
      { label: "Arrangementer", href: "/event" },
      { label: "Tilbakemeldingsskjema", href: "/feedback" },
      { label: "Prikker & Suspensjoner", href: "/punishment" },
      { label: "Betaling", href: "/payment" },
    ],
  },
  {
    label: "Bedrifter",
    icon: "tabler:moneybag",
    children: [
      { label: "Bedrifter", href: "/company" },
      { label: "Utlysninger", href: "/listing" },
    ],
  },
  {
    label: "Komiteer",
    icon: "tabler:campfire",
    children: [
      { label: "Komiteer", href: "/committee" },
      { label: "Nodekomiteer", href: "/node-committee" },
      { label: "Interessegrupper", href: "/interest-group" },
      { label: "Komitesøknader", href: "/committee-application" },
    ],
  },
  {
    label: "Media",
    icon: "tabler:photo",
    children: [
      { label: "Artikler", href: "/article" },
      { label: "Offline", href: "/offline" },
    ],
  },
  {
    label: "Brukere",
    icon: "tabler:users-group",
    children: [
      { label: "Brukere", href: "/user" },
      { label: "Medlemskap", href: "/membership" },
    ],
  },
] as const

const getInitialExpandedNavs = () => {
  const savedNavs = localStorage.getItem("expandedNavs")
  return savedNavs ? JSON.parse(savedNavs) : []
}

export const ApplicationShell: FC<PropsWithChildren> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const [expandedNavs, setExpandedNavs] = useState(getInitialExpandedNavs)

  const handleNavToggle = (label: string) => () => {
    const isExpanded = expandedNavs.includes(label)
    const updatedNavs = isExpanded ? expandedNavs.filter((nav: string) => nav !== label) : [...expandedNavs, label]

    setExpandedNavs(updatedNavs)
    localStorage.setItem("expandedNavs", JSON.stringify(updatedNavs))
  }
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShellHeader>
        <Group h="100%" px="md" justify="space-between">
          <Flex align="center" gap="sm">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Title order={2}>Monoweb Admin</Title>
          </Flex>

          <SignOutButton />
        </Group>
      </AppShellHeader>
      <AppShellNavbar p="md">
        {navigations.map((navigation) => (
          <NavLink
            key={navigation.label}
            label={navigation.label}
            leftSection={<Icon icon={navigation.icon} />}
            childrenOffset={28}
            opened={expandedNavs.includes(navigation.label)}
            onChange={handleNavToggle(navigation.label)}
          >
            {navigation.children.map((child) => (
              <NavLink key={child.label} label={child.label} href={child.href} />
            ))}
          </NavLink>
        ))}
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  )
}
