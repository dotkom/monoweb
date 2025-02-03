import Link from "next/link"
import { FacebookIcon, GitHubIcon, InstagramIcon, SlackIcon } from "../../../icons"

export const SoMeSection = () => {
  const links = [
    { icon: <SlackIcon />, url: "https://onlinentnu.slack.com/", key: "slack" },
    { icon: <GitHubIcon />, url: "https://github.com/dotkom/monoweb", key: "github" },
    { icon: <InstagramIcon />, url: "https://www.instagram.com/online_ntnu/", key: "instagram" },
    { icon: <FacebookIcon />, url: "https://www.facebook.com/groups/1547182375336132", key: "facebook" },
  ]

  return (
    <ul className="mx-8 mb-4 flex sm:justify-center">
      {links.map((link) => (
        <Link href={link.url} key={link.key}>
          <li className="mx-4 w-16 cursor-pointer">
            {link.icon}
          </li>
        </Link>
      ))}
    </ul>
  )
}
