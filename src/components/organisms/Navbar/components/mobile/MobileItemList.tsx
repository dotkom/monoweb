import { styled } from "@stitches/react";
import { FC } from "react";
import { DesktopProps } from "../../DesktopNavigation";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { NavigationMenuList } from "../desktop";

const StyledMenu = styled(NavigationMenuPrimitive.Root, {
  display: "flex",
  justifyContent: "center",
});

const NavigationMenuMobile = StyledMenu;

interface MobileItemProps {
  title: string;
}

const MobileItemList: FC<MobileItemProps> = ({ children }) => {
  return (
    <DropdownItemBox>
      <ItemContainer>
        <NavigationMenuMobile>
          <NavigationMenuList>{children}</NavigationMenuList>
        </NavigationMenuMobile>
      </ItemContainer>
    </DropdownItemBox>
  );
};

const ItemContainer = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(4, 23vw)",
  rowGap: "10px",
  marginLeft: "50px",
  "@media only screen and (max-width: 740px)": { gridTemplateColumns: "repeat(3, 30vw)" },
  "@media only screen and (max-width: 600px)": { gridTemplateColumns: "repeat(2, 42vw)" },
});

const DropdownItemBox = styled("div", {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "transparent",
  marginTop: "-10px",
});

export default MobileItemList;
