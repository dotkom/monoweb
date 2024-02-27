import React, { FC, useEffect } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { DeliveryMethod, FormSchema, InvoiceRelation } from "./form-schema"
import { Section } from "../components/section"
import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  Textarea,
  TextInput,
  Title,
} from "@dotkomonline/ui"
import { ErrorMessage } from "@hookform/error-message"
import { CustomErrorMessage } from "./custom-error-message"
import { useOrganization } from "./use-organization"
import { ControlledSelect } from "./controlled-select"

export const Form: FC = () => {
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

  useEffect(() => {
    brreg.mutate(organizationNumber)
  }, [organizationNumber, brreg.mutate])

  return (
    <>
      <Section as="fieldset">
        <legend>
          <Title element="h3">Bedriftsinformasjon</Title>
        </legend>

        <Label>
          Organisasjonsnummer, uten mellomrom
          <TextInput placeholder="992548045" {...register("organizationNumber")} pattern="[0-9]{9}" />
          <ErrorMessage name="organizationNumber" errors={formState.errors} render={CustomErrorMessage} />
        </Label>

        <Label>
          Bedriftsnavn
          <TextInput placeholder="Bedrift AS" {...register("companyName")} />
          <ErrorMessage name="companyName" errors={formState.errors} render={CustomErrorMessage} />
        </Label>

        <legend>
          <Title element="h3">Kontaktperson</Title>
        </legend>

        <Label>
          Navn
          <TextInput placeholder="Ola Nordmann" {...register("contactName")} />
          <ErrorMessage name="contactName" errors={formState.errors} render={CustomErrorMessage} />
        </Label>

        <Label>
          E-post adresse
          <TextInput placeholder="ola.nordmann@bedrift.no" type="email" {...register("contactEmail")} />
          <ErrorMessage name="contactEmail" errors={formState.errors} render={CustomErrorMessage} />
        </Label>

        <Label>
          Telefonnummer
          <TextInput placeholder="+47 444 99 55" type="tel" {...register("contactTel")} />
          <ErrorMessage name="contactTel" errors={formState.errors} render={CustomErrorMessage} />
        </Label>

        <legend>
          <Title element="h3">Velg anledningen fakturaen skal sendes for</Title>
        </legend>

        <Label>
          Anledning
          <div>
            <ControlledSelect
              control={control}
              name="invoiceRelation"
              placeholder="Velg anledning"
              options={Object.entries(InvoiceRelation).map(([key, value]) => ({
                value: key,
                label: value,
              }))}
            />
          </div>
        </Label>

        <legend>
          <Title element="h3">Fakturainformasjon</Title>
        </legend>

        <Label>
          Ønsket leveringsmetode
          <div>
            <ControlledSelect
              control={control}
              name="preferredDeliveryMethod"
              placeholder="Velg leveringsmetode"
              options={Object.entries(DeliveryMethod).map(([key, value]) => ({
                value: key,
                label: value,
              }))}
            />
          </div>
        </Label>

        <Label>
          Ønsker PO-nummer
          <TextInput placeholder="Ingen preferanse" {...register("preferredPurchaseOrderNumber")} />
        </Label>

        <Label>
          Ønsker spesiell antall dager til forfallsdato
          <TextInput type="number" placeholder="Ingen preferanse" {...register("preferredDueDateLength")} />
        </Label>

        <legend>
          <Title element="h3">Kommentarer</Title>
        </legend>
        <Label>
          Ekstra informasjon, spørsmål eller kommentarer
          <Textarea {...register("comment")} />
        </Label>
      </Section>
    </>
  )
}
