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

export const DesktopNavigation = () => (
  <DesktopNavbarContainer>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>For Studenter</NavigationMenuTrigger>
        <NavigationMenuContent>
          <DesktopList layout="one">
            <DebugCard />
            <DesktopListItem href="https://stitches.dev/" title="Webshop">
              CSS-in-JS with best-in-class developer experience.
            </DesktopListItem>
            <DesktopListItem href="/colors" title="Wiki">
              Beautiful, thought-out palettes with auto dark mode.
            </DesktopListItem>
            <DesktopListItem href="https://icons.modulz.app/" title="Ressurser">
              All informasjon om onlines ressurser.
            </DesktopListItem>
            <DesktopListItem href="https://icons.modulz.app/" title="Artikler">
              All informasjon om onlines ressurser enda mer som er rart.
            </DesktopListItem>
            <DesktopListItem href="https://icons.modulz.app/" title="Offline">
              Artikler om mye variert som er gøy
            </DesktopListItem>
          </DesktopList>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuTrigger>Om oss</NavigationMenuTrigger>
        <NavigationMenuContent>
          <DesktopList layout="three">
            <DesktopListItem title="Interessegrupper" href="/docs/primitives/overview/introduction">
              På denne siden finner du informasjon om alle de forskjellige interessegruppene i online.
            </DesktopListItem>
            <DesktopListItem title="Bidra" href="/docs/primitives/overview/styling">
              Her finner du alle open source prosjekter som online og dotkom jobber med.
            </DesktopListItem>
            <DesktopListItem title="Om online" href="/docs/primitives/overview/animation">
              Online sin about us page
            </DesktopListItem>
          </DesktopList>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuTrigger>For Bedrifter</NavigationMenuTrigger>
        <NavigationMenuContent>
          <DesktopList layout="three">
            <DesktopListItem title="Kontakt" href="/company">
              På denne siden finner du informasjon om alle.
            </DesktopListItem>
            <DesktopListItem title="Kvitteringskjema" href="/docs/primitives/overview/styling">
              Send Kvitteringskjema til Online.
            </DesktopListItem>
            <DesktopListItem title="Faktura" href="/docs/primitives/overview/animation">
              Send faktura til Online
            </DesktopListItem>
            <DesktopListItem title="Interesseskjema" href="/company">
              Meld interesse for samarbeid med Online
            </DesktopListItem>
          </DesktopList>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink href="https://github.com/radix-ui">Karriere</NavigationMenuLink>
      </NavigationMenuItem>

      <DropdownIndicator />
    </NavigationMenuList>

    <DesktopViewport />
  </DesktopNavbarContainer>
);

export default DesktopNavigation;
