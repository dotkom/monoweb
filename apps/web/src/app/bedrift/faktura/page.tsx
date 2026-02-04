"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconLoader2 } from "@tabler/icons-react"
import { FormProvider, useForm } from "react-hook-form"
import { DeliveryMethod, type FormSchema, InvoiceRelation, formSchema } from "./components/form-schema"
import { InvoiceForm } from "./components/invoice-form"
import { Section } from "./components/section"
import { useSubmitInvoiceMutation } from "./mutations"

export default function InvoicificationPage() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredDeliveryMethod: DeliveryMethod.EHF,
      invoiceRelation: InvoiceRelation.EXCURSION_PARTICIPATION,
      preferredDueDateLength: 14,
    },
  })
  const dispatch = useSubmitInvoiceMutation()
  const onSubmit = (data: FormSchema) => {
    dispatch.mutate(data)
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-12 px-3 py-12">
      <Section>
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
          <InvoiceForm />

          <Button type="submit" disabled={dispatch.isPending}>
            {dispatch.isPending ? <IconLoader2 className="animate-spin" /> : "Send inn fakturainformasjon"}
          </Button>
        </Section>
      </FormProvider>
    </main>
  )
}
