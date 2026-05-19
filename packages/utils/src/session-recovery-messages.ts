export type SessionRecoveryMessages = {
  title: string
  description: string
}

export function getSessionRecoveryMessages(
  isSessionInvalid: boolean,
  isMissingDbUser: boolean,
  isDbUserFetchError: boolean
): SessionRecoveryMessages | null {
  if (isSessionInvalid) {
    return {
      title: "Økten din er utløpt",
      description:
        "Innloggingen din er ikke lenger gyldig. Logg inn på nytt for å fortsette, eller logg ut for å fjerne den gamle økten.",
    }
  }

  if (isMissingDbUser) {
    return {
      title: "Brukerprofil mangler",
      description:
        "Vi fant ingen brukerprofil knyttet til innloggingen din. Logg inn på nytt for å fullføre registreringen.",
    }
  }

  if (isDbUserFetchError) {
    return {
      title: "Kunne ikke laste brukerprofil",
      description: "Noe gikk galt ved henting av profilen din. Logg inn på nytt, eller logg ut og prøv igjen senere.",
    }
  }

  return null
}
