"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import { FormProvider, useForm } from "react-hook-form"
import { Section } from "../components/section"
import { Form } from "./form"
import { type FormSchema, formSchema } from "./form-schema"
import { useSubmitMutation } from "./mutation"

export default function Page() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestsCompanyPresentation: false,
      requestsCourseEvent: false,
      requestsInstagramTakeover: false,
      requestsTechTalksParticipation: false,
      requestsExcursionParticipation: false,
      requestsCollaborationEvent: false,
    },
  })
  const dispatch = useSubmitMutation()
  const onSubmit = (data: FormSchema) => {
    dispatch.mutate(data)
    form.reset()
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-3 py-12">
      <Section>
        <img src="/Online_bla.svg" alt="Online logo" />
        <Title element="h1">Interesseskjema for bedrifter</Title>
        <Text>Dette skjemaet skal brukes til å melde interesse for samarbeid med Online.</Text>

        <Text>
          Når du huker av i en sjekkboks vil vi notere deres interesse og ta dette i betraktning under planlegging av
          arrangementet. I skjemaet har du også mulighet til å legge igjen en kommentar eller spørsmål. Innholdet vil
          bli sendt på mail til bedriftskomiteen, og om dere har noen spørsmål vil disse bli besvart så fort det lar seg
          gjøre. Det er mulig å fylle ut skjemaet flere ganger.
        </Text>

        <Text>Merk at skjemaet kun er for å melde interesse og fungerer da ikke som påmelding.</Text>

        <Text>
          På våre nettsider har vi en karriereside, hvor vi publiserer stillingsannonser på vegne av bedrifter som
          ønsker å fremme ledige stillinger. Dersom dette er av interesse, ønsker vi gjerne å motta henvendelser via
          e-post på <a href="mailto:bedriftskontakt@online.ntnu.no">bedriftskontakt@online.ntnu.no</a>. Eventuelle andre
          henvendelser kan også rettes til samme e-postadresse.
        </Text>
      </Section>
      <FormProvider {...form}>
        <Section as="form" onSubmit={form.handleSubmit(onSubmit)}>
          <Form />

          <Button type="submit" disabled={dispatch.isLoading}>
            {dispatch.isLoading ? (
                <Icon className="animate-spin" icon="tabler:loader-2" />
            ) : (
              "Meld interesse"
            )}
          </Button>
        </Section>
      </FormProvider>
    </main>
  )
}
