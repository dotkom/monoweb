import { FacebookIcon, GitHubIcon, InstagramIcon, SlackIcon } from "@/components/icons"

export const SoMeSection = () => {
  const icons = [
    <SlackIcon key="slack" />,
    <GitHubIcon key="github" />,
    <InstagramIcon key="instagram" />,
    <FacebookIcon key="facebook" />,
  ]

  return (
    <ul className="mx-8 mb-4 flex sm:justify-center">
      {icons.map((icon) => (
        <li key={icon.key} className="mx-4 w-16 cursor-pointer">
          {icon}
        </li>
      ))}
    </ul>
  )
}
