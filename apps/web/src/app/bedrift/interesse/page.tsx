"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { FormProvider, useForm } from "react-hook-form"
import { InterestForm } from "./components/interest-form"
import { type FormSchema, formSchema } from "./components/form-schema"
import { Section } from "./components/section"
import { useSubmitInterestMutation } from "./mutations"

export default function InterestFormPage() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestsCompanyPresentation: false,
      requestsCourseEvent: false,
      requestsTwoInOneDeal: false,
      requestsInstagramTakeover: false,
      requestsExcursionParticipation: false,
      requestsCollaborationEvent: false,
      requestsFemalesInTechEvent: false,
    },
  })
  const dispatch = useSubmitInterestMutation()
  const onSubmit = (data: FormSchema) => {
    dispatch.mutate(data)
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

        <Text>
          På våre nettsider har vi en karriereside, hvor vi publiserer stillingsannonser på vegne av bedrifter som
          ønsker å fremme ledige stillinger. Dersom dette er av interesse, ønsker vi gjerne å motta henvendelser via
          e-post på{" "}
          <a href="mailto:bedriftskontakt@online.ntnu.no" className="underline">
            bedriftskontakt@online.ntnu.no
          </a>
          . Eventuelle andre henvendelser kan også rettes til samme e-postadresse.
        </Text>
      </Section>
      <FormProvider {...form}>
        <Section as="form" onSubmit={form.handleSubmit(onSubmit)}>
          <InterestForm />

          <Button type="submit" disabled={dispatch.isPending}>
            {dispatch.isPending ? <IconLoader2 className="animate-spin" /> : "Meld interesse"}
          </Button>
        </Section>
      </FormProvider>
    </main>
  )
}
