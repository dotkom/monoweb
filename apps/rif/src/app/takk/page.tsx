"use client"

import { Text, Title } from "@dotkomonline/ui"
import { Section } from "../../components/section"

export default function TakkPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-3 py-12">
      <Section>
        <img src="/Online_bla.svg" alt="Online logo" />
        <Title element="h1">Takk for interessen.</Title>
        <Text>Takk for at du har vist interesse til bedriftssamarbeid med Linjeforeningen Online.</Text>

        <Text>Du vil nå få en bekreftelse på e-post med en kopi av informasjonen du har sendt oss.</Text>
        <Text>
          Andre henvendelser kan sendes på mail til{" "}
          <a href="mailto:bedriftskontakt@online.ntnu.no">bedriftskontakt@online.ntnu.no</a>
        </Text>
      </Section>
    </main>
  )
}
