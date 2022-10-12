import React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import {
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
    items: [
      {
        name: "Webshop",
        link: "#",
        description: "Online shop for Online merch",
      },
      {
        name: "Wiki",
        link: "#",
        description: "Student wiki med informasjon om NTNU foreninger og Online",
      },
      {
        name: "Artikler",
        link: "#",
        description: "Beautiful, thought-out palettes with auto dark mode",
      },
      {
        name: "Offline",
        link: "#",
        description: "Beautiful, thought-out palettes with auto dark mode",
      },
    ],
  },
  {
    name: "Om oss",
    items: [
      {
        name: "Interessegrupper",
        link: "#",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i online",
      },
      {
        name: "Om online",
        link: "#",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i online",
      },
    ],
  },
  {
    name: "For bedrifter",
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
              <DesktopList layout="three">
                {tab.items.map((item) => (
                  <DesktopListItem href={item.link} title={item.name} key={`${tab.name}-${item.name}`}>
                    {item.description}
                  </DesktopListItem>
                ))}
              </DesktopList>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Karriere</NavigationMenuLink>
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
