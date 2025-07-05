import { FacebookIcon } from "@/components/icons/FacebookIcon.js"
import { InstagramIcon } from "@/components/icons/InstagramIcon.js"
import { SlackIcon } from "@/components/icons/SlackIcon.js"

export const SoMeLinks = () => {
  const links = [
    {
      icon: <FacebookIcon />,
      url: "https://www.facebook.com/groups/1547182375336132",
      key: "facebook",
    },
    {
      icon: <InstagramIcon />,
      url: "https://www.instagram.com/online_ntnu/",
      key: "instagram",
    },
    { icon: <SlackIcon />, url: "https://onlinentnu.slack.com/", key: "slack" },
  ]

  return (
    <ul className="mx-8 gap-4 flex sm:justify-center">
      {links.map((link) => (
        <a href={link.url} key={link.key}>
          <li className="size-24 cursor-pointer flex justify-center items-center">{link.icon}</li>
        </a>
      ))}
    </ul>
  )
}
