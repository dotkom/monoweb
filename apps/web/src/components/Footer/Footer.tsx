import { ContactSection } from "./ContactSection"
import { LogoSection } from "./LogoSection"
import { SocialSection } from "./SocialSection"

export const Footer = () => {
  const gray_500 = "#6b7280"
  const stone_600 = "#57534e"

  return (
    <footer className="flex flex-col gap-8 md:gap-12 mt-24 mb-12 text-gray-900 dark:text-stone-400 [[data-theme=pink]_&]:rounded-[15px] [[data-theme=pink]_&]:p-6 [[data-theme=pink]_&]:bg-barbie-gradient [[data-theme=pink]_&]:text-white">
      <LogoSection />
      <SocialSection fill={gray_500} className="dark:hidden" />
      <SocialSection fill={stone_600} className="hidden md:hidden dark:inline-grid dark:md:flex" />
      <ContactSection />
    </footer>
  )
}
