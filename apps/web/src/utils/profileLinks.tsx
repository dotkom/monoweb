import AccessCardIcon from "@/components/icons/ProfileIcons/AccessCardIcon";
import AccountIcon from "@/components/icons/ProfileIcons/AccountIcon";
import EmailIcon from "@/components/icons/ProfileIcons/EmailIcon";
import MembershipIcon from "@/components/icons/ProfileIcons/MembershipIcon";
import NotificationIcon from "@/components/icons/ProfileIcons/NotificationIcon";
import PasswordIcon from "@/components/icons/ProfileIcons/PasswordIcon";
import PaymentIcon from "@/components/icons/ProfileIcons/PaymentIcon";
import PenaltyIcon from "@/components/icons/ProfileIcons/PenaltyIcon";
import PrivacyIcon from "@/components/icons/ProfileIcons/PrivacyIcon";

export const profileItems = [
  {
    title: "Min Profil",
    slug: "/profile",
    icon: AccountIcon
  },
  {
    title: "Personvern",
    slug: "/profile/privacy",
    icon: PrivacyIcon,
  },
  {
    title: "Prikker & Suspensjoner",
    slug: "/profile/penalties",
    icon: PenaltyIcon,
  },
  {
    title: "Passord",
    slug: "/profile/password",
    icon: PasswordIcon,
  },
  {
    title: "Epost",
    slug: "/profile/email",
    icon: EmailIcon,
  },
  {
    title: "Medlemskap",
    slug: "/profile/membership",
    icon: MembershipIcon,
  },
  {
    title: "Betalinger",
    slug: "/profile/payments",
    icon: PaymentIcon,
  },
  {
    title: "Varsler",
    slug: "/profile/notifications",
    icon: NotificationIcon,
  },
  {
    title: "Adgangskort (NTNU)",
    slug: "/profile/access-card",
    icon: AccessCardIcon,
  },
]
