import React, { useState } from "react";
import { styled } from "@stitches/react";
import Button from "@components/atoms/Button";
import { FiX, FiMenu, FiArrowRight } from "react-icons/fi";

import MobileViewport from "./components/mobile/MobileViewport";
import MobileItemList from "./components/mobile/MobileItemList";
import MobileItem from "./components/mobile/MobileItem";

const AboutDropdown = () => {
  return (
    <MobileItemList title="OM OSS">
      <MobileItem href="https://github.com/radix-ui">Interessegrupper</MobileItem>
      <MobileItem href="https://github.com/radix-ui">Bidra</MobileItem>
      <MobileItem href="https://github.com/radix-ui">Ressurser</MobileItem>
    </MobileItemList>
  );
};

const MobileDropdown = () => {
  const [isOpen, setIsOpen] = useState("none");

  const handleOpen = () => setIsOpen("flex");
  const handleClose = () => setIsOpen("none");

  const Modal = MobileViewport;

  return (
    <Container>
      <OpenButton onClick={handleOpen}>
        <FiMenu size={20} />
      </OpenButton>
      <Modal isOpen={isOpen}>
        <ButtonBox>
          <CloseButton onClick={handleClose}>
            <FiX size={20} />
          </CloseButton>
        </ButtonBox>
        <DropdownItemsContainer>
          <AboutDropdown />
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
  marginTop: "70px",
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

const Container = styled("div", { display: "flex", flexDirection: "column", alginItems: "center" });

export default MobileDropdown;
