import Navbar, {
  ContentList,
  ContentListItem,
  ContentListItemCallout,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@components/organisms/Navbar/Navbar";
import { Box } from "@components/primitives";
import MainAvatar from "./Avatar";
import MobileDropdown from "./MobileDropdown";
import NavbarLogo from "./NavbarLogo";
import DropdownMenuDemo from "./UserDropdown";

const Fullbar = () => {
  return (
    <Box
      css={{
        boxShadow: `0 0.1px 1px #0d0d0d`,
        height: "70px",
        backgroundColor: "white",
        width: "100vw",
        padding: 4,
        borderRadius: 6,
        display: "flex",
        zIndex: 100,
        position: "relative",
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
        <Navbar></Navbar>
        <Box css={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <DropdownMenuDemo />
        </Box>
      </Box>
      <Box
        css={{
          display: "none",
          width: "100%",
          "@media only screen and (max-width: 900px)": {
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          },
        }}
      >
        <MobileDropdown />
      </Box>
    </Box>
  );
};

export default Fullbar;
