import { ContactLinkSection } from "./ContactLinkSection"
import { ContactSection } from "./ContactSection"
import { SocialSection } from "./SocialSection"

export const Footer = () => (
  <footer className="bg-brand-9 py-16">
    <div className="mx-auto max-w-screen-xl px-4 lg:px-10 flex items-center flex-col gap-8">
      <SocialSection />
      <ContactLinkSection />
      <ContactSection />
    </div>
  </footer>
)
