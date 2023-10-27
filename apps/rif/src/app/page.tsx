"use client"

import { experimental_useFormState } from "react-dom"
import { Form } from "./form"
import { action } from "./action"
import { Text, Title } from "@dotkomonline/ui"
import { Section } from "../components/section"

export default function Page() {
  const [, formAction] = experimental_useFormState(action, {})

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-3 py-12">
      <Section>
        <Title element="h1">Interesseskjema for bedrifter</Title>
        <Text>Dette skjemaet skal brukes til å melde interesse for samarbeid med Online.</Text>

        <Text>
          Når du huker av i en sjekkboks vil vi notere deres interesse og ta dette i betraktning under planlegging av
          arrangementet. I skjemaet har du også mulighet til å legge igjen en kommentar eller spørsmål. Innholdet vil
          bli sendt på mail til bedriftskomiteen, og om dere har noen spørsmål vil disse bli besvart så fort det lar seg
          gjøre. Det er mulig å fylle ut skjemaet flere ganger.
        </Text>

        <Text>Merk at skjemaet kun er for å melde interesse og fungerer da ikke som påmelding.</Text>

        <Text>Andre henvendelser kan sendes på mail til bedriftskontakt@online.ntnu.no.</Text>
      </Section>
      <Section as="form" action={formAction}>
        <Form />
      </Section>
    </main>
  )
}
