"use client";

import { Icon } from "@iconify/react";
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type FC, type PropsWithChildren } from "react";

import { SignOutButton } from "./SignOutButton";

const navigations = [
  {
    children: [
      { href: "/event", label: "Arrangementer" },
      { href: "/feedback", label: "Tilbakemeldingsskjema" },
      { href: "/punishment", label: "Prikker & Suspensjoner" },
      { href: "/payment", label: "Betaling" },
    ],
    icon: "tabler:wheelchair",
    label: "Arrangementer",
  },
  {
    children: [
      { href: "/company", label: "Bedrifter" },
      { href: "/listing", label: "Utlysninger" },
    ],
    icon: "tabler:moneybag",
    label: "Bedrifter",
  },
  {
    children: [
      { href: "/committee", label: "Komiteer" },
      { href: "/node-committee", label: "Nodekomiteer" },
      { href: "/interest-group", label: "Interessegrupper" },
      { href: "/committee-application", label: "Komitesøknader" },
    ],
    icon: "tabler:campfire",
    label: "Komiteer",
  },
  {
    children: [
      { href: "/article", label: "Artikler" },
      { href: "/offline", label: "Offline" },
    ],
    icon: "tabler:photo",
    label: "Media",
  },
  {
    children: [
      { href: "/user", label: "Brukere" },
      { href: "/membership", label: "Medlemskap" },
    ],
    icon: "tabler:users-group",
    label: "Brukere",
  },
] as const;

export const ApplicationShell: FC<PropsWithChildren> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        breakpoint: "sm",
        collapsed: { desktop: !desktopOpened, mobile: !mobileOpened },
        width: 300,
      }}
      padding="md"
    >
      <AppShellHeader>
        <Group h="100%" justify="space-between" px="md">
          <Flex align="center" gap="sm">
            <Burger hiddenFrom="sm" onClick={toggleMobile} opened={mobileOpened} size="sm" />
            <Burger onClick={toggleDesktop} opened={desktopOpened} size="sm" visibleFrom="sm" />
            <Title order={2}>Monoweb Admin</Title>
          </Flex>

          <SignOutButton />
        </Group>
      </AppShellHeader>
      <AppShellNavbar p="md">
        {navigations.map((navigation) => (
          <NavLink
            childrenOffset={28}
            key={navigation.label}
            label={navigation.label}
            leftSection={<Icon icon={navigation.icon} />}
          >
            {navigation.children.map((child) => (
              <NavLink href={child.href} key={child.label} label={child.label} />
            ))}
          </NavLink>
        ))}
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
};
