<<<<<<< HEAD
export const profileItems = [
  {
    title: "Min profil",
    slug: "/profile",
  },
  {
    title: "Personvern",
    slug: "/profile/privacy",
  },
  {
    title: "Prikker & Suspensjoner",
    slug: "/profile/penalties",
  },
  {
    title: "Passord",
    slug: "/profile/password",
  },
  {
    title: "Epost",
    slug: "/profile/email",
  },
  {
    title: "Medlemskap",
    slug: "/profile/membership",
  },
  {
    title: "Betalinger",
    slug: "/profile/payments",
  },
  {
    title: "Varsler",
    slug: "/profile/notifications",
  },
  {
    title: "Adgangskort (NTNU)",
    slug: "/profile/access-card",
=======
import {
  ProfileEmail,
  ProfileEntryCard,
  ProfileLanding,
  ProfileMarks,
  ProfileMembership,
  ProfileNotifications,
  ProfilePassword,
  ProfilePayment,
  ProfilePrivacy,
} from "@/components/views/ProfileView/components"

export const profileItems = [
  {
    title: "Min profil",
    slug: "me",
    component: <ProfileLanding />,
  },
  {
    title: "Personvern",
    slug: "privacy",
    component: <ProfilePrivacy />,
  },
  {
    title: "Prikker & Suspensjoner",
    slug: "penalties",
    component: <ProfileMarks />,
  },
  {
    title: "Passord",
    slug: "password",
    component: <ProfilePassword />,
  },
  {
    title: "Epost",
    slug: "email",
    component: <ProfileEmail />,
  },
  {
    title: "Medlemskap",
    slug: "membership",
    component: <ProfileMembership />,
  },
  {
    title: "Betalinger",
    slug: "payments",
    component: <ProfilePayment />,
  },
  {
    title: "Varsler",
    slug: "notifications",
    component: <ProfileNotifications />,
  },
  {
    title: "Adgangskort (NTNU)",
    slug: "access-card",
    component: <ProfileEntryCard />,
>>>>>>> ce87d8d (feat: broken logic)
  },
]
