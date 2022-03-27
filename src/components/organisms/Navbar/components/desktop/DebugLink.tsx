import { mauve } from "@radix-ui/colors";
import { FiAlertTriangle } from "react-icons/fi";
import { NavigationMenuLink } from ".";
import { LinkText, LinkTitle, ListItem } from "./ContentListItem";

const DebugLink = () => (
  <ListItem css={{ gridRow: "span 3" }}>
    <NavigationMenuLink
      href="/https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"
      css={{
        display: "flex",
        justifyContent: "flex-end",
        flexDirection: "column",
        width: "80%",
        height: "80%",
        background: `linear-gradient(135deg, $red8 0%, $red3 100%);`,
        borderRadius: 6,
        padding: 25,
      }}
    >
      <FiAlertTriangle size={40} color="white" />
      <LinkTitle
        css={{
          fontSize: 18,
          color: "white",
          marginTop: 16,
          marginBottom: 7,
        }}
      >
        Debug
      </LinkTitle>
      <LinkText
        css={{
          fontSize: 14,
          color: mauve.mauve4,
          lineHeight: 1.3,
        }}
      >
        Trenger du noen å snakke med?!
      </LinkText>
    </NavigationMenuLink>
  </ListItem>
);

export default DebugLink;
