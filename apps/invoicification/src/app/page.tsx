"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import Image from "next/image"
import { FormProvider, useForm } from "react-hook-form"
import { Section } from "../components/section"
import { Form } from "./form"
import { DeliveryMethod, type FormSchema, InvoiceRelation, formSchema } from "./form-schema"
import { useSubmitMutation } from "./mutation"

export default function Page() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredDeliveryMethod: DeliveryMethod.EHF,
      invoiceRelation: InvoiceRelation.EXCURSION_PARTICIPATION,
      preferredDueDateLength: 14,
    },
  })
  const dispatch = useSubmitMutation()
  const onSubmit = (data: FormSchema) => {
    dispatch.mutate(data)
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-3 py-12">
      <Section>
        <Image src="/Online_bla.svg" alt="Online logo" width={0} height={0} className="w-full" />
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

          <Button type="submit" disabled={dispatch.isPending}>
            {dispatch.isPending ? (
              <Icon className="animate-spin" icon="tabler:loader-2" />
            ) : (
              "Send inn fakturainformasjon"
            )}
          </Button>
        </Section>
      </FormProvider>
    </main>
  )
}
