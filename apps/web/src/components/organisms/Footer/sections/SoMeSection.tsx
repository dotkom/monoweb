import Link from "next/link"
import { FacebookIcon, GitHubIcon, InstagramIcon, SlackIcon } from "../../../icons"

export const SoMeSection = () => {
  const links = [
    { icon: <SlackIcon key="slack" />, url: "https://onlinentnu.slack.com/" },
    { icon: <GitHubIcon key="github" />, url: "https://github.com/dotkom/monoweb" },
    { icon: <InstagramIcon key="instagram" />, url: "https://www.instagram.com/online_ntnu/" },
    { icon: <FacebookIcon key="facebook" />, url: "https://www.facebook.com/groups/1547182375336132" },
  ]

  return (
    <ul className="mx-8 mb-4 flex sm:justify-center">
      {links.map((link) => (
        <Link href={link.url} key={link.icon.key}>
          <li key={link.icon.key} className="mx-4 w-16 cursor-pointer">
            {link.icon}
          </li>
        </Link>
      ))}
    </ul>
  )
}
