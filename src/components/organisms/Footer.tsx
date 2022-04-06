import { VFC } from "react";
import { styled } from "@theme";
import { SlackIcon } from "@components/icons/SlackIcon";
import { GitHubIcon } from "@components/icons/GitHubIcon";
import { InstagramIcon } from "@components/icons/InstagramIcon";
import { FacebookIcon } from "@components/icons/FacebookIcon";
import { FooterHat } from "./FooterHat";
import "./footer.css";

interface FooterProps {
  test: string;
}

const Wrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const FooterComponent = styled("footer", {
  backgroundColor: "$blue1",
  color: "White",
  width: "100%",
  paddingTop: "1.5em",
  paddingBottom: "2.4em",
  zIndex: 1000,
});

const PeePee = styled("p", {
  margin: 0,
});

const Dot = styled("a", {
  color: "$orange2",
});

const Link = styled("a", {
  fontSize: "1.2em",
  padding: "1px 10px",
  cursor: "pointer",

  textDecoration: "none",

  variants: {
    size: {
      big: {
        fontWeight: "bold",
        fontSize: "1.5em",
      },
      small: {
        "&:not(:last-of-type)": {
          borderRight: "solid 2px White",
        },
      },
    },
  },
});

const Section = styled("div", {
  textAlign: "center",
  margin: "auto",

  variants: {
    marginSize: {
      small: {
        marginBottom: "0.5em",
      },
      medium: {
        marginBottom: "1.8em",
      },
    },
  },
});

const Footer: VFC<FooterProps> = ({ test }) => {
  const bigLinks = ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"];
  const smallLinks = ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"];

  return (
    <Wrapper>
      <FooterHat />

      <FooterComponent>
        <Section marginSize="small">
          <SlackIcon />
          <GitHubIcon />
          <InstagramIcon />
          <FacebookIcon />
        </Section>

        <Section marginSize="small">
          {bigLinks.map((link) => (
            <Link className="simpleUnderline" size="big" key={link}>
              {link}
            </Link>
          ))}
        </Section>

        <Section marginSize="medium">
          {smallLinks.map((link) => (
            <Link size="small" key={link}>
              {link}
            </Link>
          ))}
        </Section>

        <Section>
          <PeePee>Feil på nettsiden?</PeePee>
          <PeePee>
            Ta kontakt med{" "}
            <Dot href="https://gergus.no/" className="underline">
              Dotkom
            </Dot>
          </PeePee>
        </Section>
      </FooterComponent>
    </Wrapper>
  );
};

export default Footer;
