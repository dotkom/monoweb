import { FacebookIcon } from "@/components/icons/FacebookIcon"
import { GitHubIcon } from "@/components/icons/GithubIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import { SlackIcon } from "@/components/icons/SlackIcon"

export const SoMeSection = () => {
  const icons = [
    <SlackIcon key="slack" />,
    <GitHubIcon key="github" />,
    <InstagramIcon key="instagram" />,
    <FacebookIcon key="facebook" />,
  ]

  return (
    <ul className="mb-4 flex justify-center gap-8">
      {icons.map((icon) => (
        <li key={icon.key} className="w-16 cursor-pointer">
          {icon}
        </li>
      ))}
    </ul>
  )
}
