import { ContactSection } from "./sections/ContactSection"
import { LinksSection } from "./sections/LinksSection"
import { SoMeSection } from "./sections/SoMeSection"

export interface FooterLinkType {
  main: string[]
  second: string[]
}

const footerLinks: FooterLinkType = {
  main: ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"],
  second: ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"],
}

const Footer = () => (
  <footer className="bg-blue flex w-full flex-col py-16">
    <SoMeSection />
    <LinksSection links={footerLinks} />
    <ContactSection />
  </footer>
)

export default Footer
