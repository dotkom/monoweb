import HemitLogo from "/logo-hemit.svg"

interface SponsorProps {
  name: string
  logo: string
  link: string
}

export const Sponsors: SponsorProps[] = [
  {
    name: "Hemit",
    logo: HemitLogo,
    link: "https://hemit.no",
  },
]
