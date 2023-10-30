"use client"

import { Form } from "./form"
import { Button, Text, Title } from "@dotkomonline/ui"
import { Section } from "../components/section"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSubmitMutation } from "./mutation"
import { FormSchema, formSchema } from "./form-schema"

export default function Page() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestsCompanyPresentation: false,
      requestsCourseEvent: false,
      requestsJobListing: false,
      requestsInstagramTakeover: false,
      requestsTechTalksParticipation: false,
      requestsExcursionParticipation: false,
    },
  })
  const dispatch = useSubmitMutation()
  const onSubmit = (data: FormSchema) => {
    dispatch.mutate(data)
    form.reset()
    alert("Skjemaet er levert, du vil få en bekreftelse på e-post.")
  }

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
      <FormProvider {...form}>
        <Section as="form" onSubmit={form.handleSubmit(onSubmit)}>
          <Form />

          <Button type="submit" disabled={dispatch.isLoading}>
            Meld interesse
          </Button>
        </Section>
      </FormProvider>
    </main>
  )
}
