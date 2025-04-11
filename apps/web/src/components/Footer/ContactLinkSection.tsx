import type { FC } from "react"
import { FooterLink } from "./FooterLink"

const links = {
  navigation: [
    {
      label: "Profil",
      href: "/profile",
    },
    {
      label: "Hjem",
      href: "/",
    },
    {
      label: "Karriere",
      href: "/career",
    },
    {
      label: "Wiki",
      href: "/wiki",
    },
    { label: "Bidra", href: "/contribute" },
  ],
  address: [
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
} as const

export const ContactLinkSection: FC = () => (
  <div className="flex items-center gap-4 flex-col flex-wrap">
    <ul className="flex justify-center gap-x-8 gap-y-2 flex-wrap">
      {links.navigation.map((link) => (
        <FooterLink label={link.label} href={link.href} key={link.label} large />
      ))}
    </ul>
    <ul className="flex justify-center gap-x-8 gap-y-2 flex-wrap">
      {links.address.map((link) => (
        <FooterLink label={link.label} href={link.href} key={link.label} />
      ))}
    </ul>
  </div>
)
