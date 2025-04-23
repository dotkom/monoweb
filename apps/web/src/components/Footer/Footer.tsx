import { ContactSection } from "./ContactSection"
import { LogoSection } from "./LogoSection"
import { SocialSection } from "./SocialSection"

export const Footer = () => (
  <footer className="pt-24 pb-12 text-slate-10">
    <div className="max-w-screen-xl px-12 lg:px-24 flex flex-col gap-12">
      <LogoSection />
      <SocialSection />
      <ContactSection />
    </div>
  </footer>
)
