import React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import {
  DebugCard,
  DesktopList,
  DesktopListItem,
  DesktopNavbarContainer,
  DesktopViewport,
  DropdownIndicator,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./components/desktop"
import Profile from "./components/profile"
import NavbarLogo from "./components/logo"
import { styled } from "@stitches/react"

export const NavigationMenuItem = NavigationMenuPrimitive.Item

const tabs = [
  {
    name: "For studenter",
    layout: "one",
    card: "debug",
    items: [
      {
        name: "Webshop",
        link: "https://stitches.dev/",
        description: "CSS-in-JS with best-in-class developer experience",
      },
      {
        name: "Wiki",
        link: "https://stitches.dev/",
        description: "Beautiful, thought-out palettes with auto dark mode",
      },
      {
        name: "Ressurser",
        link: "https://stitches.dev/",
        description: "CSS-in-JS with best-in-class developer experience",
      },
      {
        name: "Artikler",
        link: "https://stitches.dev/",
        description: "Beautiful, thought-out palettes with auto dark mode",
      },
      {
        name: "Offline",
        link: "https://stitches.dev/",
        description: "Beautiful, thought-out palettes with auto dark mode",
      },
    ],
  },
  {
    name: "Om oss",
    layout: "three",
    card: "none",
    items: [
      {
        name: "Interessegrupper",
        link: "/docs/primitives/overview/introduction",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i online",
      },
      {
        name: "Bidra",
        link: "/docs/primitives/overview/introduction",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i online",
      },
      {
        name: "Om online",
        link: "/docs/primitives/overview/introduction",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i online",
      },
    ],
  },
  {
    name: "For bedrifter",
    layout: "three",
    card: "none",
    items: [
      { name: "Kontakt", link: "/company", description: "På denne siden finner du informasjon om alle" },
      { name: "Kvitteringskjema", link: "/company", description: "På denne siden finner du informasjon om alle" },
      { name: "Faktura", link: "/company", description: "På denne siden finner du informasjon om alle" },
      { name: "Interesseskjema", link: "/company", description: "På denne siden finner du informasjon om alle" },
    ],
  },
]

export const DesktopNavigation = () => (
  <DesktopBox>
    <FlexCenter>
      <NavbarLogo />
    </FlexCenter>
    <DesktopNavbarContainer>
      <NavigationMenuList>
        {tabs.map((tab) => (
          <NavigationMenuItem key={tab.name}>
            <NavigationMenuTrigger>{tab.name}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <DesktopList layout={tab.layout as unknown as { [x: string]: "one" | "three" | "two" }}>
                {tab.card == "debug" && <DebugCard />}
                {tab.items.map((item) => (
                  <DesktopListItem href={item.link} title={item.name} key={`${tab.name}-${item.name}`}>
                    CSS-in-JS with best-in-class developer experience.
                  </DesktopListItem>
                ))}
              </DesktopList>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuLink href="https://github.com/radix-ui">Karriere</NavigationMenuLink>
        </NavigationMenuItem>

        <DropdownIndicator />
      </NavigationMenuList>

      <DesktopViewport />
    </DesktopNavbarContainer>
    <FlexCenter>
      <Profile />
    </FlexCenter>
  </DesktopBox>
)

const DesktopBox = styled("div", {
  display: "grid",
  gridTemplateColumns: "1fr 3fr 1fr",
  margin: "auto",
  width: "80%",
  "@media only screen and (max-width: 1200px)": { width: "90%" },
  "@media only screen and (max-width: 900px)": { display: "none" },
})

const FlexCenter = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
})

export default DesktopNavigation
