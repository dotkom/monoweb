"use client"

import { Text, Title } from "@dotkomonline/ui"
import Image from "next/image"
import { Section } from "../../components/section"

export default function TakkPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-3 py-12">
      <Section>
        <Image src="/Online_bla.svg" alt="Online logo" width={0} height={0} className="w-full" />
        <Title element="h1">Takk for fakturainformasjonen.</Title>
        <Text>Takk for at du sendte inn fakturainformasjon.</Text>

        <Text>
          Andre henvendelser kan sendes på mail til{" "}
          <a href="mailto:bedriftskontakt@online.ntnu.no">bedriftskontakt@online.ntnu.no</a>
        </Text>
      </Section>
    </main>
  )
}
