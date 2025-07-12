import { ContactSection } from "./ContactSection"
import { LogoSection } from "./LogoSection"
import { SocialSection } from "./SocialSection"

export const Footer = () => (
  <footer className="mt-24 mb-12 text-gray-900">
    <div className="max-w-screen-xl px-4 lg:px-12 flex flex-col gap-8 md:gap-12">
      <LogoSection />
      <SocialSection />
      <ContactSection />
    </div>
  </footer>
)
