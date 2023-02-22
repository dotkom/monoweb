"use client"

import { FC, PropsWithChildren } from "react"
import {
  AppShell,
  Flex,
  Box,
  Title,
  Group,
  Header,
  Navbar,
  Button,
  NavLink,
  Text,
  Image,
  useMantineColorScheme,
} from "@mantine/core"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { useSelectedLayoutSegment } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"

const ApplicationHeader: FC = () => {
  const colorScheme = useMantineColorScheme()

  return (
    <Header height={60}>
      <Group className="h-full" px="sm" position="apart">
        <Flex align="center" columnGap="sm">
          <Link href="/">
            <Image src="/Online_bla_o.png" alt="Online Logo" width={32} height={32} />
          </Link>
          <Title m={0} order={3}>
            OnlineWeb Dashboard
          </Title>
        </Flex>
        <Group>
          <Button variant="subtle" onClick={() => colorScheme.toggleColorScheme()}>
            <Icon icon="mdi:theme-light-dark" width={28} height={28} />
          </Button>
          <a href="https://new.online.ntnu.no">
            <Button variant="outline" leftIcon={<Icon icon="material-symbols:arrow-back" />}>
              Tilbake til OW
            </Button>
          </a>
        </Group>
      </Group>
    </Header>
  )
}

const SIDEBAR_LINKS = [
  {
    icon: "material-symbols:wheelchair-pickup",
    href: "/event",
    label: "Arrangementer",
    targetSegment: "event",
  },
  {
    icon: "lucide:tent",
    href: "/committee",
    label: "Komiteer",
    targetSegment: "committee",
  },
]

const ApplicationSidebar: FC = () => {
  const segment = useSelectedLayoutSegment()
  const { data, status } = useSession()
  return (
    <Navbar width={{ base: 360 }}>
      <Navbar.Section grow>
        {SIDEBAR_LINKS.map(({ href, label, targetSegment, icon }) => (
          <Link key={href} href={href} className="no-underline active:no-underline">
            <NavLink
              active={segment === targetSegment}
              childrenOffset="xl"
              icon={<Icon icon={icon} />}
              label={<Text size="xl">{label}</Text>}
            />
          </Link>
        ))}
      </Navbar.Section>
      <Navbar.Section>
        <Box className="border-gray-2 border-t p-3">
          <Group position="apart">
            {status === "authenticated" && data !== null ? (
              <>
                <Flex columnGap="xs">
                  {data.user.image !== null ? (
                    <Image width={40} height={40} radius={9999} src={data.user.image ?? "/"} alt="Profile picture" />
                  ) : (
                    <Icon width={40} height={40} icon="mdi:account-circle" />
                  )}
                  <Box>
                    <Text size="sm" weight={500}>
                      {data.user.name}
                    </Text>
                    <Text color="dimmed" size="xs">
                      {data.user.email}
                    </Text>
                  </Box>
                </Flex>
                <Button variant="outline" onClick={() => signOut()}>
                  Logg ut
                </Button>
              </>
            ) : (
              <>
                <Button fullWidth onClick={() => signIn("onlineweb")}>
                  Logg inn
                </Button>
                <Button variant="outline" fullWidth onClick={() => signIn("onlineweb")}>
                  Registrer bruker
                </Button>
              </>
            )}
          </Group>
        </Box>
      </Navbar.Section>
    </Navbar>
  )
}

export const ApplicationShell: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AppShell
      padding="md"
      navbar={<ApplicationSidebar />}
      header={<ApplicationHeader />}
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === "light" ? theme.colors.gray[0] : theme.colors.gray[9] },
      })}
    >
      {children}
    </AppShell>
  )
}
