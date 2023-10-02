import PenaltyIcon from "@/components/icons/ProfileIcons/PenaltyIcon"
import { Icon } from "@dotkomonline/ui"

const width = 24

export const profileItems = [
  {
    title: "Min Profil",
    slug: "/profile",
    icon: <Icon icon={"tabler:user-circle"} width={width} />,
  },
  {
    title: "Personvern",
    slug: "/profile/privacy",
    icon: <Icon icon={"tabler:shield-half-filled"} width={width} />,
  },
  {
    title: "Prikker & Suspensjoner",
    slug: "/profile/penalties",
    icon: <PenaltyIcon />,
  },
  {
    title: "Passord",
    slug: "/profile/password",
    icon: <Icon icon={"tabler:lock"} width={width} />,
  },
  {
    title: "Epost",
    slug: "/profile/email",
    icon: <Icon icon={"tabler:mail-filled"} width={width} />,
  },
  {
    title: "Medlemskap",
    slug: "/profile/membership",
    icon: <Icon icon={"tabler:award"} width={width} />,
  },
  {
    title: "Betalinger",
    slug: "/profile/payments",
    icon: <Icon icon={"tabler:credit-card"} width={width} />,
  },
  {
    title: "Varsler",
    slug: "/profile/notifications",
    icon: <Icon icon={"tabler:bell-ringing-filled"} width={width} />,
  },
  {
    title: "Adgangskort (NTNU)",
    slug: "/profile/access-card",
    icon: <Icon icon={"tabler:school"} width={width} />,
  },
]
