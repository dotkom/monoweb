import React, { FC } from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { CSS } from "@stitches/react/types/css-util";
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

export interface DesktopProps {
  children?: Element[] | Element | string;
  title?: string;
  href?: string;
  css?: CSS<{}, {}, {}, {}>;
}

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
            <DesktopListItem href="https://icons.modulz.app/" title="Icons">
              A crisp set of 15x15 icons, balanced and consistent.
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
            <DesktopListItem title="Ressurser" href="/docs/primitives/overview/animation">
              All informasjon om onlines ressurser.
            </DesktopListItem>
          </DesktopList>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink href="https://github.com/radix-ui">Karriere</NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="/company">For Bedrifter</NavigationMenuLink>
      </NavigationMenuItem>

      <DropdownIndicator />
    </NavigationMenuList>

    <DesktopViewport />
  </DesktopNavbarContainer>
);

export default DesktopNavigation;
