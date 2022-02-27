import { VFC } from "react";
import { FacebookIcon } from "@components/icons/FacebookIcon";
import { GitHubIcon } from "@components/icons/GitHubIcon";
import { InstagramIcon } from "@components/icons/InstagramIcon";
import { SlackIcon } from "@components/icons/SlackIcon";

const List = styled("ul", {
  padding: 0,
  margin: 0,
});

export const SoMeLinks: VFC = () => {
  const someIcons = [SlackIcon, GitHubIcon, InstagramIcon, FacebookIcon];

  return (
    <List>
      {someIcons.map((Icon) => (
        <Icon key={Icon} />
      ))}
    </List>
  );
};
