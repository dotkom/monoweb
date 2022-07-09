import { styled } from "@theme";
import { VFC } from "react";
import { FooterSection } from "../components/FooterSection";

const Text = styled("p", {
  margin: 0,
});

const Link = styled("a", {
  color: "$orange2",
  textDecoration: "none",
  position: "relative",
});

export const ContactSection: VFC = () => (
  <FooterSection>
    <Text>Feil på nettsiden?</Text>
    <Text>
      Ta kontakt med{" "}
      <Link href="mailto:dotkom@online.ntnu.no" className="underline">
        Dotkom
      </Link>
    </Text>
  </FooterSection>
);
