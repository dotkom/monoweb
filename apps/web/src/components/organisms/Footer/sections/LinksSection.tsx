import { Fragment, VFC } from "react"
import { FooterSection } from "../components/FooterSection"
import { Link } from "../components/Link"

interface LinksSectionProps {
  links: {
    main: string[]
    second: string[]
  }
}

export const LinksSection: VFC<LinksSectionProps> = ({ links }) => (
  <Fragment>
    <FooterSection marginSize="small">
      {links.main.map((link) => (
        <Link type="main" key={link}>
          {link}
        </Link>
      ))}
    </FooterSection>

    <FooterSection marginSize="medium">
      {links.second.map((link) => (
        <Link type="secondary" key={link}>
          {link}
        </Link>
      ))}
    </FooterSection>
  </Fragment>
)
