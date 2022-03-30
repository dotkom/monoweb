import React from "react";
import { styled } from "@stitches/react";
import { mauve } from "@radix-ui/colors";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { FiMenu } from "react-icons/fi";
import { slideDownAndFade, slideLeftAndFade, slideRightAndFade, slideUpAndFade } from "./keyframes/keyframes";

const StyledContent = styled(DropdownMenuPrimitive.Content, {
  minWidth: 300,
  backgroundColor: "white",
  borderRadius: 6,
  padding: 5,
  boxShadow: "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
  "@media (prefers-reduced-motion: no-preference)": {
    animationDuration: "400ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "forwards",
    willChange: "transform, opacity",
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

const itemStyles = {
  all: "unset",
  fontSize: 16,
  lineHeight: 1,
  color: "#000",
  borderRadius: 3,
  display: "flex",
  alignItems: "center",
  height: 25,
  padding: "5px",
  position: "relative",
  paddingLeft: 25,
  userSelect: "none",
  cursor: "pointer",

  "&[data-disabled]": {
    color: "$gray6",
    pointerEvents: "none",
  },

  "&:focus": {
    color: "$gray9",
  },
  variants: {
    layout: {
      one: {
        color: "&red3",
      },
    },
  },
};

const StyledItem = styled(DropdownMenuPrimitive.Item, { ...itemStyles });

const StyledLabel = styled(DropdownMenuPrimitive.Label, {
  paddingLeft: 25,
  fontSize: 12,
  lineHeight: "25px",
  color: "$gray2",
});

const StyledSeparator = styled(DropdownMenuPrimitive.Separator, {
  height: 1,
  backgroundColor: "$gray11",
  margin: 5,
});

// Exports
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const Box = styled("div", {});

const IconButton = styled("button", {
  all: "unset",
  marginRight: "20px",
  height: 35,
  width: 35,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  cursor: "pointer",
  "&:hover": { color: "gray" },
});

const StyledTriggerItem = styled(DropdownMenuPrimitive.TriggerItem, {
  '&[data-state="open"]': {
    backgroundColor: "$blue3",
    color: "$blue11",
  },
  ...itemStyles,
});

export const DropdownMenuTriggerItem = StyledTriggerItem;

export const MobileDropdown = () => (
  <Box>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton aria-label="Customise options">
          <FiMenu size={20} />
        </IconButton>
      </DropdownMenuTrigger>

      <StyledContent sideOffset={5}>
        <StyledItem>Profil</StyledItem>
        <StyledItem>Dashboard</StyledItem>
        <StyledItem>Adminpanel</StyledItem>

        <StyledSeparator />
        <StyledLabel>For studenter</StyledLabel>

        <StyledItem>Webshop</StyledItem>
        <StyledItem>Wiki</StyledItem>
        <StyledItem>Offline</StyledItem>
        <StyledItem>Artikler</StyledItem>

        <StyledSeparator />
        <StyledLabel>Om oss</StyledLabel>
        <StyledItem>Interessegrupper</StyledItem>
        <StyledItem>Om online</StyledItem>
        <StyledSeparator />

        <StyledItem>For bedrifter</StyledItem>
        <StyledItem>Karriere</StyledItem>
        <StyledSeparator />
        <StyledItem
          css={{
            color: "$red3",
            fontWeight: 600,
            "&:hover": {
              color: "$red9",
            },
          }}
        >
          Logg ut
        </StyledItem>
      </StyledContent>
    </DropdownMenu>
  </Box>
);

export default MobileDropdown;
