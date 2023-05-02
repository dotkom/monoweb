import Image from "next/image"
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
    {/* Built with   */}
    <Image className="self-center mt-4" src="/vercel.svg" alt="vercel" width={150} height={30}/>
  </footer>
)

export default Footer
