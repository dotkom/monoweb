import DesktopNavigation from "@components/organisms/Navbar/DesktopNavigation";
import { useEffect, useState } from "react";
import NavbarLogo from "./components/logo";
import Profile from "./components/profile";
import MobileDropdown from "./MobileDropdown";
import { styled } from "@stitches/react";
import { createStyles } from "@theme";

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
    <Container css={{ boxShadow: shadow, backgroundColor: color, margin: 0, padding: 0 }}>
      {/*TODO: Split into Mobile Navbar and Desktop Navbar components and use ternary operator*/}
      <DesktopBox>
        <FlexCenter>
          <NavbarLogo />
        </FlexCenter>
        <DesktopNavigation />
        <FlexCenter>
          <Profile />
        </FlexCenter>
      </DesktopBox>
      <MobileBox>
        <FlexCenter css={{ justifyContent: "flex-start", marginLeft: "30px" }}>
          <NavbarLogo />
        </FlexCenter>
        <FlexCenter css={{ justifyContent: "flex-end" }}>
          <MobileDropdown />
        </FlexCenter>
      </MobileBox>
    </Container>
  );
};

const MobileBox = styled("div", {
  display: "none",
  width: "100%",
  "@media only screen and (max-width: 900px)": {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
});

const FlexCenter = styled("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const DesktopBox = styled("div", {
  display: "grid",
  gridTemplateColumns: "1fr 3fr 1fr",
  margin: "auto",
  width: "80%",
  "@media only screen and (max-width: 1200px)": { width: "90%" },
  "@media only screen and (max-width: 900px)": { display: "none" },
});

const Container = styled("div", {
  height: "70px",
  width: "100vw",
  display: "flex",
  zIndex: 100,
  position: "fixed",
  top: 0,
  marginBottom: "70px",
  transition: "background-color 200ms linear",
});

export default Navbar;
