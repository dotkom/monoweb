import HemitLogo from "/logo-hemit.svg"

interface SponsorProps {
  name: string
  logo: string
  link: string
}

const Sponsors: SponsorProps[] = [
  {
    name: "Hemit",
    logo: HemitLogo,
    link: "https://hemit.no",
  },
]

export default Sponsors
