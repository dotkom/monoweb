import { FacebookIcon } from "@components/icons/FacebookIcon";
import { GitHubIcon } from "@components/icons/GitHubIcon";
import { InstagramIcon } from "@components/icons/InstagramIcon";
import { SlackIcon } from "@components/icons/SlackIcon";
import { VFC } from "react";
import { FooterSection } from "../components/FooterSection";

export const SoMeSection: VFC = () => (
  <FooterSection marginSize="small">
    <SlackIcon />
    <GitHubIcon />
    <InstagramIcon />
    <FacebookIcon />
  </FooterSection>
);
