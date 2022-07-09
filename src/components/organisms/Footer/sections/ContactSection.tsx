import { styled } from "@theme";
import { VFC } from "react";
import { FooterSection } from "../components/FooterSection";

const Text = styled("p", {
  margin: 0,
});

const FancyLink = styled("a", {
  color: "$orange2",
  textDecoration: "none",
  position: "relative",
  "&::before": {
    content: "",
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 0,
    height: "0.1em",
    backgroundColor: "$orange2",
    transition: "width 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
  },
  "&:hover::before": {
    left: 0,
    right: "auto",
    width: "100%",
  },
});

export const ContactSection: VFC = () => (
  <FooterSection>
    <Text>Feil på nettsiden?</Text>
    <Text>
      Ta kontakt med{" "}
      <FancyLink href="mailto:dotkom@online.ntnu.no" className="underline">
        Dotkom
      </FancyLink>
    </Text>
  </FooterSection>
);
