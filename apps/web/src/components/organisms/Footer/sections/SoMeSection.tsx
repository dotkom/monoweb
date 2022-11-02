import { FacebookIcon, GitHubIcon, InstagramIcon, SlackIcon } from "@/components/icons"

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
        <li key={icon.key} className="w-12 cursor-pointer md:w-16">
          {icon}
        </li>
      ))}
    </ul>
  )
}
