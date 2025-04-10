import { ContactSection } from "./sections/ContactSection"
import { LinksSection } from "./sections/LinksSection"
import { SoMeSection } from "./sections/SoMeSection"

export interface FooterLinkType {
  main: {
    label: string
    href: string
  }[]
  second: {
    label: string
    href: string
  }[]
}

const footerLinks: FooterLinkType = {
  main: [
    {
      label: "PROFIL",
      href: "/profile",
    },
    {
      label: "HJEM",
      href: "/",
    },
    {
      label: "KARRIERE",
      href: "/career",
    },
    {
      label: "WIKI",
      href: "/wiki",
    },
    { label: "BIDRA", href: "/contribute" },
  ],
  second: [
    {
      label: "Besøksadresse",
      href: "",
    },
    {
      label: "Kontaktinformasjon",
      href: "",
    },
    { label: "Post og faktura", href: "" },
  ],
}

export const Footer = () => (
  <footer className="bg-blue flex w-full flex-col py-16 px-2 sm:px-10">
    <SoMeSection />
    <LinksSection links={footerLinks} />
    <ContactSection />
  </footer>
)
