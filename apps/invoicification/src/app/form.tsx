import React, { FC, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { FormSchema } from "./form-schema"
import { Section } from "../components/section"
import { Label, TextInput, Title } from "@dotkomonline/ui"
import { ErrorMessage } from "@hookform/error-message"
import { CustomErrorMessage } from "./custom-error-message"
import { useOrganization } from "./use-organization"

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
      </Section>
    </>
  )
}
