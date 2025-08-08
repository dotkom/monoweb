"use client"

import { Icon } from "@iconify/react"
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Button,
  Flex,
  Group,
  NavLink,
  Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { FC, PropsWithChildren } from "react"

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
      { label: "Utlysninger", href: "/job-listing" },
    ],
  },
  {
    label: "Grupper",
    icon: "tabler:campfire",
    children: [
      { label: "Grupper", href: "/group" },
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
    children: [{ label: "Brukere", href: "/user" }],
  },
] as const

export const ApplicationShell: FC<PropsWithChildren> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const pathname = usePathname()

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

          <Button component="a" variant="outline" href="/api/auth/logout">
            Logg ut
          </Button>
        </Group>
      </AppShellHeader>
      <AppShellNavbar p="md">
        {navigations.map((navigation) => (
          <NavLink
            key={navigation.label}
            label={navigation.label}
            leftSection={<Icon icon={navigation.icon} />}
            childrenOffset={28}
            defaultOpened
          >
            {navigation.children.map((child) => (
              <NavLink
                component={Link}
                key={child.label}
                label={child.label}
                href={child.href}
                active={pathname.startsWith(child.href)}
                variant="subtle"
                onNavigate={() => {
                  mobileOpened && toggleMobile()
                }}
              />
            ))}
          </NavLink>
        ))}
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  )
}
