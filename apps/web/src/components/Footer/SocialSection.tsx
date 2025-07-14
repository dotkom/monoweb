import { FacebookIcon } from "@/components/icons/FacebookIcon"
import { GitHubIcon } from "@/components/icons/GitHubIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { SlackIcon } from "@/components/icons/SlackIcon"
import { Text, cn } from "@dotkomonline/ui"
import Link from "next/link"

interface SocialSectionProps {
  fill: `#${string}`
  className?: string
}

export const SocialSection = ({ fill, className }: SocialSectionProps) => {
  const links = [
    {
      icon: <SlackIcon className="h-6" fill={fill} />, //
      url: "https://onlinentnu.slack.com/",
      key: "Slack",
    },
    {
      icon: <InstagramIcon className="h-6" fill={fill} />,
      url: "https://www.instagram.com/online_ntnu/",
      key: "Instagram",
    },
    {
      icon: <FacebookIcon className="h-6" fill={fill} />,
      url: "https://www.facebook.com/groups/1547182375336132",
      key: "Facebook",
    },
    {
      icon: <GitHubIcon className="h-6" fill={fill} />, //
      url: "https://github.com/dotkom/monoweb",
      key: "Github",
    },
  ]

  return (
    <div
      className={cn(
        "inline-grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-start md:flex md:flex-row md:gap-12",
        className
      )}
    >
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
