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
  useMantineTheme,
} from "@mantine/core"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { useSelectedLayoutSegment } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"

const ApplicationHeader: FC = () => {
  return (
    <Header height={60}>
      <Group sx={{ height: "100%" }} px="sm" position="apart">
        <Flex align="center" columnGap="sm">
          <Link href="/">
            <Image src="/Online_bla_o.png" alt="Online Logo" width={32} height={32} />
          </Link>
          <Title m={0} order={3}>
            OnlineWeb Dashboard
          </Title>
        </Flex>
        <a href="https://new.online.ntnu.no">
          <Button variant="outline" leftIcon={<Icon icon="material-symbols:arrow-back" />}>
            Tilbake til OW
          </Button>
        </a>
      </Group>
    </Header>
  )
}

const SIDEBAR_LINKS = [
  {
    href: "/event",
    label: "Arrangementer",
    targetSegment: "event",
  },
]

const ApplicationSidebar: FC = () => {
  const segment = useSelectedLayoutSegment()
  const theme = useMantineTheme()
  const { data, status } = useSession()
  return (
    <Navbar width={{ base: 360 }}>
      <Navbar.Section grow>
        {SIDEBAR_LINKS.map(({ href, label, targetSegment }) => (
          <Link key={href} href={href} className="next-link">
            <NavLink
              active={segment === targetSegment}
              childrenOffset="xl"
              icon={<Icon icon="material-symbols:wheelchair-pickup" />}
              label={<Text size="xl">{label}</Text>}
            />
          </Link>
        ))}
      </Navbar.Section>
      <Navbar.Section>
        <Box
          sx={{
            paddingTop: theme.spacing.sm,
            borderTop: `1px solid ${theme.colors.gray[2]}`,
            padding: theme.spacing.xs,
          }}
        >
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
        main: { backgroundColor: theme.colors.gray[0] },
      })}
    >
      {children}
    </AppShell>
  )
}
