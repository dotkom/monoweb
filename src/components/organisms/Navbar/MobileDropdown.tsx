import React, { useState } from "react";
import { styled } from "@stitches/react";
import Button from "@components/atoms/Button";
import { FiX, FiMenu, FiChevronRight, FiArrowRight, FiClock, FiActivity } from "react-icons/fi";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./DesktopNavigation";

const StyledMenu = styled(NavigationMenuPrimitive.Root, {
  display: "flex",
  justifyContent: "center",
});

const NavigationMenuMobile = StyledMenu;

const AboutDropDown = () => {
  return (
    <DropdownItemBox>
      <DropdownItemTitle>OM OSS</DropdownItemTitle>
      <ItemContainer>
        <NavigationMenuMobile>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="https://github.com/radix-ui">Interesegrupper</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="https://github.com/radix-ui">Bidra</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="https://github.com/radix-ui">Ressurser</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenuMobile>
      </ItemContainer>
    </DropdownItemBox>
  );
};

const ItemContainer = styled("div", {
  display: "grid",
  gridTemplateColumns: "repeat(4, 23vw)",
  rowGap: "10px",
  "@media only screen and (max-width: 740px)": { gridTemplateColumns: "repeat(3, 30vw)" },
  "@media only screen and (max-width: 600px)": { gridTemplateColumns: "repeat(2, 42vw)" },
});

const DropdownItemTitle = styled("p", {
  fontSize: "14px",
  fontWeight: 550,
  color: "$gray5",
});

const DropdownItemBox = styled("div", {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "transparent",
  marginTop: "-10px",
});

const MobileDropdown = () => {
  const [isOpen, setIsOpen] = useState("none");

  const handleOpen = () => setIsOpen("flex");
  const handleClose = () => setIsOpen("none");

  const Container = styled("div", { display: "flex", flexDirection: "column", alginItems: "center" });

  const Modal = styled("div", {
    position: "absolute",
    backgroundColor: "#fff",
    boxShadow: "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",

    minWidth: "95vw",
    flexDirection: "column",
    marginLeft: "-90vw",
    display: `${isOpen}`,
    borderRadius: "5px",
  });
  return (
    <Container>
      <OpenButton onClick={handleOpen}>
        <FiMenu size={20} />
      </OpenButton>
      <Modal>
        <ButtonBox>
          <CloseButton onClick={handleClose}>
            <FiX size={20} />
          </CloseButton>
        </ButtonBox>
        <DropdownItemsContainer>
          <AboutDropDown />
        </DropdownItemsContainer>
        <DownBox>
          <Button>
            Profil <FiArrowRight size={18} />
          </Button>
        </DownBox>
      </Modal>
    </Container>
  );
};

const DropdownItemsContainer = styled("div", {
  marginTop: "-30px",
  marginLeft: "30px",
});

const DownBox = styled("div", {
  width: "100%",
  backgroundColor: "$bluebg",
  height: "75px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const OpenButton = styled("button", {
  marginRight: "20px",
  backgroundColor: "transparent",
  border: "none",
  "&:hover": {
    color: "Gray",
    cursor: "pointer",
  },
});

const ButtonBox = styled("div", {
  display: "flex",
  justifyContent: "right",
  width: "100%",
});

const CloseButton = styled("button", {
  border: "none",
  backgroundColor: "#fff",
  marginTop: "10px",
  height: "30px",
  marginRight: "10px",
  width: "40px",
  borderRadius: 20,
  "&:hover": {
    color: "Gray",
    cursor: "pointer",
  },
  zIndex: 1000,
});

export default MobileDropdown;
