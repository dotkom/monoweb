import { ContactSection } from "./Sections/ContactSection"
import { LinksSection } from "./Sections/LinksSection"
import { SoMeSection } from "./Sections/SoMeSection"

export interface FooterLinkType {
  main: string[]
  second: string[]
}

const footerLinks: FooterLinkType = {
  main: ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"],
  second: ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"],
}

export const Footer = () => (
  <footer className="bg-blue flex w-full flex-col py-16">
    <SoMeSection />
    <LinksSection links={footerLinks} />
    <ContactSection />
  </footer>
)
