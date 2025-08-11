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
  useMantineColorScheme,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type FC, type PropsWithChildren, useEffect } from "react"

const navigations = [
  {
    label: "Arrangementer",
    icon: "tabler:wheelchair",
    href: "/event",
  },
  {
    label: "Prikker & Suspensjoner",
    icon: "tabler:exclamation-mark",
    href: "/punishment",
  },
  {
    label: "Bedrifter",
    icon: "tabler:moneybag",
    href: "/company",
  },
  {
    label: "Utlysninger",
    icon: "tabler:briefcase",
    href: "/job-listing",
  },
  {
    label: "Grupper",
    icon: "tabler:campfire",
    href: "/group",
  },
  {
    label: "Artikler",
    icon: "tabler:photo",
    href: "/artikler",
  },
  {
    label: "Offline",
    icon: "tabler:skull",
    href: "/offline",
  },
  {
    label: "Brukere",
    icon: "tabler:users-group",
    href: "/user",
  },
] as const

export const ApplicationShell: FC<PropsWithChildren> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const pathname = usePathname()
  const { toggleColorScheme } = useMantineColorScheme()

  // biome-ignore lint/correctness/useExhaustiveDependencies: should only trigger on pathname change
  useEffect(() => {
    if (mobileOpened) {
      toggleMobile()
    }
  }, [pathname])

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

          <Flex align="center" gap="sm">
            <Button onClick={toggleColorScheme} variant="outline" visibleFrom="xs">
              Bytt fargetema
            </Button>
            <Button component="a" variant="outline" href="/api/auth/logout" visibleFrom="xs">
              Logg ut
            </Button>
          </Flex>
        </Group>
      </AppShellHeader>
      <AppShellNavbar p="md">
        {navigations.map((navigation) => (
          <NavLink
            component={Link}
            key={navigation.label}
            label={navigation.label}
            href={navigation.href}
            active={pathname.startsWith(navigation.href)}
            variant="subtle"
            leftSection={<Icon icon={navigation.icon} />}
          />
        ))}
        <Button component="a" variant="outline" href="/api/auth/logout" hiddenFrom="xs" mt="lg">
          Logg ut
        </Button>
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  )
}
