"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { Section } from "../components/section"
import { FormProvider, useForm } from "react-hook-form"
import { DeliveryMethod, formSchema, FormSchema, InvoiceRelation } from "./form-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import { Form } from "./form"

export default function Page() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredDeliveryMethod: DeliveryMethod.EHF,
      invoiceRelation: InvoiceRelation.EXCURSION_PARTICIPATION,
      preferredDueDateLength: 14,
    },
  })
  const dispatch = {
    isLoading: false,
  }
  const onSubmit = (data: FormSchema) => {
    console.log(data)
    form.reset()
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-3 py-12">
      <Section>
        <img src="/Online_bla.svg" alt="Online logo" />
        <Title element="h1">Fakturaskjema for bedrifter</Title>
        <Text>
          Denne blanketten bør helst fylles ut av <strong>økonomiavdelingen</strong>. Informasjonen forsikrer at det
          ikke oppstår feil eller manglende informasjon ved fakturering og betaling.
        </Text>

        <Text className="[&>a]:underline">
          Eventuelle spørsmål kan sendes til kontakten deres, eventuelt til{" "}
          <a href="mailto:bankom@online.ntnu.no">bankom@online.ntnu.no</a>,{" "}
          <a href="mailto:bedkom@online.ntnu.no">bedkom@online.ntnu.no</a> eller{" "}
          <a href="mailto:fagkom@online.ntnu.no">fagkom@online.ntnu.no</a>
        </Text>
      </Section>
      <FormProvider {...form}>
        <Section as="form" onSubmit={form.handleSubmit(onSubmit)}>
          <Form />

          <Button type="submit" disabled={dispatch.isLoading}>
            {dispatch.isLoading ? (
              <>
                <Icon className="animate-spin" icon="tabler:loader-2" />
              </>
            ) : (
              "Send inn fakturainformasjon"
            )}
          </Button>
        </Section>
      </FormProvider>
    </main>
  )
}
