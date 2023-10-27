"use client"

import { FC } from "react"
import { experimental_useFormStatus } from "react-dom"
import { Button, Checkbox, Label, Text, Textarea, TextInput, Title } from "@dotkomonline/ui"
import { Section } from "../components/section"

export const Form: FC = () => {
  const { pending } = experimental_useFormStatus()

  return (
    <>
      <Section as="fieldset" aria-disabled={pending}>
        <legend>
          <Title element="h3">Bedriftsinformasjon</Title>
        </legend>
        <Label>
          Bedriftsnavn
          <TextInput placeholder="Bedrift AS" name="companyName" />
        </Label>
      </Section>

      <Section as="fieldset" aria-disabled={pending}>
        <legend>
          <Title element="h3">Kontaktperson</Title>
        </legend>

        <Label>
          Navn
          <TextInput placeholder="Ola Nordmann" name="contactName" />
        </Label>

        <Label>
          E-post adresse
          <TextInput placeholder="ola.nordmann@bedrift.no" name="contactEmail" type="email" />
        </Label>

        <Label>
          Telefonnummer
          <TextInput placeholder="+47 444 99 55" name="contactTel" type="tel" />
        </Label>
      </Section>

      <Section as="fieldset" aria-disabled={pending}>
        <legend>
          <Title element="h3">Hva er dere interessert i?</Title>
        </legend>
        <Text>
          Kryss av for det dere vil melde interesse for. Vi vil notere deres interesse, og ta kontakt om dere er
          aktuelle.
        </Text>

        <Checkbox label="Bedriftsarrangement" />
        <Checkbox label="Annonse i Offline" />
        <Checkbox label="Stillingsutlysning" />
        <Checkbox label="Tech Talks" />
        <Checkbox label="IT-ekskursjonen" />
      </Section>

      <Section as="fieldset" aria-disabled={pending}>
        <legend>
          <Title element="h3">Hva er dere interessert i?</Title>
        </legend>
        <Text>
          Gjerne utdyp om dere har noen tanker om hvordan et arrangement kan se ut eller annet relevant. Still også
          spørsmål om dere lurer på noe.
        </Text>

        <Textarea rows={10} />
      </Section>

      <Button type="submit">Meld interesse</Button>
    </>
  )
}
