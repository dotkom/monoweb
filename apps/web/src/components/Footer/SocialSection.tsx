import { FacebookIcon } from "@/components/icons/FacebookIcon"
import { GitHubIcon } from "@/components/icons/GitHubIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { SlackIcon } from "@/components/icons/SlackIcon"
import { Text } from "@dotkomonline/ui"
import Link from "next/link"

export const SocialSection = () => {
  const slate_6 = "#8b8d98"

  const links = [
    {
      icon: <SlackIcon className="h-6" fill={slate_6} />, //
      url: "https://onlinentnu.slack.com/",
      key: "Slack",
    },
    {
      icon: <InstagramIcon className="h-6" fill={slate_6} />,
      url: "https://www.instagram.com/online_ntnu/",
      key: "Instagram",
    },
    {
      icon: <FacebookIcon className="h-6" fill={slate_6} />,
      url: "https://www.facebook.com/groups/1547182375336132",
      key: "Facebook",
    },
    {
      icon: <GitHubIcon className="h-6" fill={slate_6} />, //
      url: "https://github.com/dotkom/monoweb",
      key: "Github",
    },
  ]

  return (
    <div className="inline-grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-start md:flex md:flex-row md:gap-12">
      {links.map((link) => (
        <Link href={link.url} key={link.key} className="flex flex-row gap-2 items-center hover:underline">
          {link.icon}{" "}
          <Text element="p" className="text-lg">
            {link.key}
          </Text>
        </Link>
      ))}
    </div>
  )
}
