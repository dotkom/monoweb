"use client"

import { Title } from "@dotkomonline/ui"
import { Section } from "../components/section"

export default function Page() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-3 py-12">
      <Section>
        <img src="/Online_bla.svg" alt="Online logo" />
        <Title element="h1">Fakturaskjema for bedrifter</Title>
      </Section>
    </main>
  )
}
