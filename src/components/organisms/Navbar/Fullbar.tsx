import Navbar from "@components/organisms/Navbar/Navbar";
import { Box } from "@components/primitives";
import { blackA } from "@radix-ui/colors";
import MainAvatar from "./Avatar";
import NavbarLogo from "./NavbarLogo";

const Fullbar = () => {
  return (
    <Box
      css={{
        boxShadow: `0 2px 10px ${blackA.blackA7}`,
        height: "70px",
        backgroundColor: "white",
        width: "100vw",
        padding: 4,
        borderRadius: 6,
        display: "flex",
      }}
    >
      <Box
        css={{
          display: "grid",
          gridTemplateColumns: "1fr 3fr 1fr",
          margin: "auto",
          width: "80%",
          "@media only screen and (max-width: 1200px)": { width: "90%" },
          "@media only screen and (max-width: 900px)": { width: "100%" },
          "@media only screen and (max-width: 760px)": { display: "none" },
        }}
      >
        <Box css={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <NavbarLogo />
        </Box>
        <Navbar></Navbar>
        <Box css={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <MainAvatar />
        </Box>
      </Box>
      <Box
        css={{
          display: "none",
          width: "100%",
          "@media only screen and (max-width: 760px)": {
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          },
        }}
      >
        <p>Better luck next time :))</p>
      </Box>
    </Box>
  );
};

export default Fullbar;
