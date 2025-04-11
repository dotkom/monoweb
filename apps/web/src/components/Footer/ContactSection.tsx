import { Text } from "@dotkomonline/ui"
import type { FC } from "react"

export const ContactSection: FC = () => (
  <div className="text-white flex flex-col text-center font-medium">
    <Text>Oppdaget en feil på nettsiden?</Text>
    <Text>
      Ta kontakt med{" "}
      <a className="underline" href="mailto:dotkom@online.ntnu.no">
        Dotkom
      </a>
    </Text>
  </div>
)
