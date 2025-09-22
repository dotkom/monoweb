"use client"

import {
  Anchor,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Breadcrumbs,
  Burger,
  Button,
  Flex,
  Group,
  NavLink,
  Space,
  Title,
  useMantineColorScheme,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconBriefcase,
  IconCampfire,
  IconClipboardList,
  IconExclamationMark,
  IconMoneybag,
  IconPhoto,
  IconPhotoShare,
  IconSkull,
  IconUsersGroup,
  IconWheelchair,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type FC, useEffect } from "react"

const navigations = [
  {
    label: "Arrangementer",
    icon: IconWheelchair,
    href: "/event",
  },
  {
    label: "Prikker & Suspensjoner",
    icon: IconExclamationMark,
    href: "/punishment",
  },
  {
    label: "Bedrifter",
    icon: IconMoneybag,
    href: "/company",
  },
  {
    label: "Utlysninger",
    icon: IconBriefcase,
    href: "/job-listing",
  },
  {
    label: "Grupper",
    icon: IconCampfire,
    href: "/group",
  },
  {
    label: "Artikler",
    icon: IconPhoto,
    href: "/article",
  },
  {
    label: "Offline",
    icon: IconSkull,
    href: "/offline",
  },
  {
    label: "Brukere",
    icon: IconUsersGroup,
    href: "/user",
  },
  {
    label: "Plakatbestilling",
    icon: IconPhotoShare,
    href: "https://fern-smelt-8a2.notion.site/1c7ae7670a5180f2ada1c29699a1f44f",
    openInNewTab: true,
  },
  {
    label: "Hendelseslogg",
    icon: IconClipboardList,
    href: "/audit-log",
    isAdmin: true,
  },
] satisfies {
  label: string
  icon: FC
  href: string
  openInNewTab?: boolean
  isAdmin?: boolean
}[]
interface ApplicationShellProps {
  isAdmin: boolean
  children: React.ReactNode
}

export const ApplicationShell: FC<ApplicationShellProps> = ({ isAdmin, children }) => {
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
            <Title order={2}>OnlineWeb dashboard</Title>
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
        {navigations
          .filter((navigation) => isAdmin || !navigation.isAdmin)
          .map((navigation) => (
            <NavLink
              component={Link}
              key={navigation.label}
              label={navigation.label}
              href={navigation.href}
              active={pathname.startsWith(navigation.href)}
              variant="subtle"
              leftSection={<navigation.icon width={18} height={18} />}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
              {...(navigation.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            />
          ))}
        <Button component="a" variant="outline" href="/api/auth/logout" hiddenFrom="xs" mt="lg">
          Logg ut
        </Button>
      </AppShellNavbar>
      <AppShellMain>
        <Breadcrumbs>
          <Anchor href="/" size="sm" key="0-home">
            hjem
          </Anchor>
          {pathname
            .slice(1)
            .split("/")
            .map((part, index, parts) => {
              const href = `/${parts.slice(0, index + 1).join("/")}`
              return (
                <Anchor href={href} size="sm" key={`${index + 1}-${part}`}>
                  {part || "-"}
                </Anchor>
              )
            })}
        </Breadcrumbs>
        <Space h="xl" />
        {children}
      </AppShellMain>
    </AppShell>
  )
}
