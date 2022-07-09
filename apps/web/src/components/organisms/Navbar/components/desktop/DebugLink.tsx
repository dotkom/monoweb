import { mauve } from "@radix-ui/colors"
import { css } from "@theme"
import { FiAlertTriangle } from "react-icons/fi"
import { NavigationMenuLink } from "."
import { LinkText, LinkTitle } from "./ContentListItem"

const DebugLink = () => (
  <li className={styles.list()}>
    <NavigationMenuLink
      className={styles.menuLink()}
      href="/https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"
    >
      <FiAlertTriangle size={40} color="white" />
      <LinkTitle className={styles.title()}>Debug</LinkTitle>
      <LinkText className={styles.text()}>Trenger du noen å snakke med?!</LinkText>
    </NavigationMenuLink>
  </li>
)

const styles = {
  list: css({
    gridRow: "span 3",
  }),
  menuLink: css({
    display: "flex",
    justifyContent: "flex-end",
    flexDirection: "column",
    width: "80%",
    height: "80%",
    background: `linear-gradient(135deg, $red8 0%, $red3 100%);`,
    borderRadius: 6,
    padding: 25,
  }),
  title: css({
    fontSize: 18,
    color: "white",
    marginTop: 16,
    marginBottom: 7,
  }),
  text: css({
    fontSize: 14,
    color: mauve.mauve4,
    lineHeight: 1.3,
  }),
}

export default DebugLink
