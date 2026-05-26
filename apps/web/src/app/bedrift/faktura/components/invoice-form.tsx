"use client"

import { TextInput, Textarea, Title } from "@dotkomonline/ui"
import { ErrorMessage } from "@hookform/error-message"
import { type FC, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { ControlledSelect } from "./controlled-select"
import { CustomErrorMessage } from "./custom-error-message"
import { DeliveryMethod, type FormSchema, InvoiceRelation } from "./form-schema"
import { Section } from "./section"
import { useOrganization } from "./use-organization"

export const InvoiceForm: FC = () => {
  const { register, control, formState, watch, setValue, setError, clearErrors } = useFormContext<FormSchema>()
  const brreg = useOrganization((data) => {
    if ("status" in data && data.status === 400) {
      setError("organizationNumber", {
        type: "manual",
        message: "Ugyldig eller ukjent organisasjonsnummer",
      })
      return
    }
    clearErrors("organizationNumber")
    setValue("companyName", data.navn)
  })
  const organizationNumber = watch("organizationNumber")

  const { mutate: brregMutate } = brreg

  useEffect(() => {
    if (organizationNumber?.length !== 9) {
      return
    }
    brregMutate(organizationNumber)
  }, [organizationNumber, brregMutate])

  return (
    <Section as="fieldset" className="gap-8">
      <Section>
        <Title element="legend">Bedriftsinformasjon</Title>
        <TextInput
          label="Organisasjonsnummer, uten mellomrom"
          placeholder="992548045"
          {...register("organizationNumber")}
          pattern="[0-9]{9}"
        />
        <ErrorMessage
          name="organizationNumber"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />

        <TextInput label="Bedriftsnavn" placeholder="Bedrift AS" {...register("companyName")} />
        <ErrorMessage
          name="companyName"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />
      </Section>

      <Section>
        <Title element="legend">Kontaktperson</Title>

        <TextInput label="Navn" placeholder="Ola Nordmann" {...register("contactName")} />
        <ErrorMessage
          name="contactName"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />

        <TextInput
          label="E-post adresse"
          placeholder="ola.nordmann@bedrift.no"
          type="email"
          {...register("contactEmail")}
        />
        <ErrorMessage
          name="contactEmail"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />

        <TextInput label="Telefonnummer" placeholder="+47 444 99 55" type="tel" {...register("contactTel")} />
        <ErrorMessage
          name="contactTel"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />
      </Section>

      <Section>
        <Title element="legend">Velg anledningen fakturaen skal sendes for</Title>

        <ControlledSelect
          control={control}
          name="invoiceRelation"
          placeholder="Velg anledning"
          options={Object.values(InvoiceRelation).map((value) => ({
            value,
            children: value,
          }))}
        />
        <ErrorMessage
          name="invoiceRelation"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />
      </Section>

      <Section>
        <Title element="legend">Fakturainformasjon</Title>

        <ControlledSelect
          control={control}
          name="preferredDeliveryMethod"
          placeholder="Velg leveringsmetode"
          options={Object.entries(DeliveryMethod).map(([_key, value]) => ({
            value,
            children: value,
          }))}
        />
        <ErrorMessage
          name="preferredDeliveryMethod"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />

        <TextInput
          label="Ønsket PO-nummer"
          placeholder="Ingen preferanse"
          {...register("preferredPurchaseOrderNumber")}
        />
        <ErrorMessage
          name="preferredPurchaseOrderNumber"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />

        <TextInput
          label="Ønsket antall dager til forfallsdato"
          type="number"
          placeholder="Ingen preferanse"
          {...register("preferredDueDateLength")}
        />
        <ErrorMessage
          name="preferredDueDateLength"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />
      </Section>

      <Section>
        <Title element="legend">Kommentarer</Title>
        <Textarea
          label="Ekstra informasjon, spørsmål eller kommentarer"
          placeholder="Ingen kommentar"
          {...register("comment")}
        />
        <ErrorMessage
          name="comment"
          errors={formState.errors}
          render={({ message }) => <CustomErrorMessage message={message} />}
        />
      </Section>
    </Section>
  )
}
