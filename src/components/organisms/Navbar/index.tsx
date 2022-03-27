import DesktopNavigation from "@components/organisms/Navbar/DesktopNavigation";
import { Box } from "@components/primitives";
import { useEffect, useState } from "react";
import MobileDropdown from "./MobileDropdown";
import NavbarLogo from "./NavbarLogo";
import DropdownMenuDemo from "./UserDropdown";

const Navbar = () => {
  const [color, setColor] = useState("transparent");
  const [shadow, setShadow] = useState("0 0.1px 0.2px #0d0d0d");

  const changeNavbarColor = () => setColor("#fff");
  const revertNavbarColor = () => setColor("transparent");

  const changeShadow = () => setShadow("0 0.1px 1px #0d0d0d");
  const revertShadow = () => setShadow("0 0.1px 0.2px #0d0d0d");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        changeNavbarColor();
        changeShadow();
      }
      if (window.scrollY < 40) {
        revertNavbarColor();
        revertShadow();
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box
      css={{
        boxShadow: shadow,
        height: "70px",
        backgroundColor: color,
        width: "100vw",
        display: "flex",
        zIndex: 100,
        position: "fixed",
        top: 0,
        marginBottom: "70px",
      }}
    >
      <Box
        css={{
          display: "grid",
          gridTemplateColumns: "1fr 3fr 1fr",
          margin: "auto",
          width: "80%",
          "@media only screen and (max-width: 1200px)": { width: "90%" },
          "@media only screen and (max-width: 900px)": { display: "none" },
        }}
      >
        <Box css={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <NavbarLogo />
        </Box>
        <DesktopNavigation />
        <Box css={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <DropdownMenuDemo />
        </Box>
      </Box>
      <Box
        css={{
          display: "none",
          width: "100%",
          "@media only screen and (max-width: 900px)": {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          },
        }}
      >
        <Box
          css={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            marginLeft: "30px",
          }}
        >
          <NavbarLogo />
        </Box>
        <Box css={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <MobileDropdown />
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
