import { Box } from "@components/primitives";
import { styled } from "@stitches/react";
import Image from "next/image";
import OnlineIcon from "@components/atoms/OnlineIcon";

const NavbarLogo = () => {
  return (
    <Box css={{ width: "100px", height: "45px" }}>
      <OnlineIcon />
    </Box>
  );
};

export default NavbarLogo;
