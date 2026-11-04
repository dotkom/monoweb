import { Link } from "@/components/link"
import { Text } from "@dotkomonline/ui"

export const BugReportEmailRequired = () => {
  return (
    <Text>
      Du må ha en e-postadresse for å rapportere en feil. Legg til en e-postadresse i{" "}
      <Link href="/innstillinger/bruker" className="underline">
        innstillinger/bruker
      </Link>{" "}
      eller kontakt{" "}
      <a href="mailto:dotkom@online.ntnu.no" className="underline">
        Dotkom
      </a>
      .
    </Text>
  )
}
