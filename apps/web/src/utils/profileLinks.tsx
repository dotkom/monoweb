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
  },
]
