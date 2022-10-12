import { useRouter } from "next/router"
import React, { FC, useEffect, useState } from "react"
import {
  ProfileLanding,
  ProfileEntryCard,
  ProfileGdpr,
  ProfileMarks,
  ProfileMembership,
  ProfilePassword,
  ProfilePayment,
  ProfileWarnings,
} from "./components"

const ProfileContentContainer = () => {
  const [title, setTitle] = useState("Min Profil")
  const router = useRouter()
  useEffect(() => {
    if (typeof router.query.state === "string") {
      setTitle(router.query.state)
    }
  }, [router.query.state])

  switch (title) {
    case "Min profil":
      return <ProfileLanding />
    case "Personvern":
      return <ProfileGdpr />
    case "Prikker & Suspensjoner":
      return <ProfileMarks />
    case "Passord":
      return <ProfilePassword />
    case "Medlemskap":
      return <ProfileMembership />
    case "Betalinger":
      return <ProfilePayment />
    case "Varsler":
      return <ProfileWarnings />
    case "Adgangskort (NTNU)":
      return <ProfileEntryCard />
    default:
      return <ProfileLanding />
  }
}

export default ProfileContentContainer
