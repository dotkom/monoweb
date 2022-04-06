import React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
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
} from "./components/desktop";

export const NavigationMenuItem = NavigationMenuPrimitive.Item;

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
];

export const DesktopNavigation = () => (
  <DesktopNavbarContainer>
    <NavigationMenuList>
      {tabs.map((tab) => (
        <NavigationMenuItem>
          <NavigationMenuTrigger>{tab.name}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <DesktopList layout={tab.layout}>
              {tab.card == "debug" && <DebugCard />}
              {tab.items.map((item) => (
                <DesktopListItem href={item.link} title={item.name}>
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
);

export default DesktopNavigation;
