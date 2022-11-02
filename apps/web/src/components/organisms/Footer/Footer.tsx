import { ContactSection } from "./sections/ContactSection"
import { LinksSection } from "./sections/LinksSection"
import { SoMeSection } from "./sections/SoMeSection"

const links = {
  main: ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"],
  second: ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"],
}

const Footer = () => (
  <footer className="flex w-full flex-col">
    <div className="bg-blue w-full pt-6 pb-10">
      <SoMeSection />
      <LinksSection links={links} />
      <ContactSection />
    </div>
  </footer>
)

export default Footer
