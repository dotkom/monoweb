"use client"

import { FC } from "react"
import { Checkbox, Label, Text, Textarea, TextInput, Title } from "@dotkomonline/ui"
import { Section } from "../components/section"
import { Controller, useFormContext } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"
import { CustomErrorMessage } from "./custom-error-message"
import { FormSchema } from "./form-schema"

export const Form: FC = () => {
  const { register, control, formState } = useFormContext<FormSchema>()

  return (
    <>
      <Section as="fieldset">
        <legend>
          <Title element="h3">Bedriftsinformasjon</Title>
        </legend>
        <Label>
          Bedriftsnavn
          <TextInput placeholder="Bedrift AS" {...register("companyName")} />
          <ErrorMessage name="companyName" errors={formState.errors} render={CustomErrorMessage} />
        </Label>
      </Section>

      <Section as="fieldset">
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

      <Section as="fieldset">
        <legend>
          <Title element="h3">Hva er dere interessert i?</Title>
        </legend>
        <Text>
          Kryss av for det dere vil melde interesse for. Vi vil notere deres interesse, og ta kontakt om dere er
          aktuelle.
        </Text>

        <Controller
          control={control}
          name="requestsCompanyPresentation"
          render={({ field }) => (
            <Checkbox label="Bedriftsarrangement" onCheckedChange={field.onChange} checked={field.value} />
          )}
        />

        <Controller
          control={control}
          name="requestsCourseEvent"
          render={({ field }) => <Checkbox label="Kurs" onCheckedChange={field.onChange} checked={field.value} />}
        />

        <Controller
          control={control}
          name="requestsOfflineAdvertisement"
          render={({ field }) => (
            <Checkbox label="Annonse i Offline" onCheckedChange={field.onChange} checked={field.value} />
          )}
        />

        <Controller
          control={control}
          name="requestsJobListing"
          render={({ field }) => (
            <Checkbox label="Stillingsutlysning" onCheckedChange={field.onChange} checked={field.value} />
          )}
        />

        <Controller
          control={control}
          name="requestsInstagramTakeover"
          render={({ field }) => (
            <Checkbox label="Instagram takeover" onCheckedChange={field.onChange} checked={field.value} />
          )}
        />

        <Controller
          control={control}
          name="requestsTechTalksParticipation"
          render={({ field }) => <Checkbox label="Tech Talks" onCheckedChange={field.onChange} checked={field.value} />}
        />

        <Controller
          control={control}
          name="requestsExcursionParticipation"
          render={({ field }) => (
            <Checkbox label="IT-ekskursjonen" onCheckedChange={field.onChange} checked={field.value} />
          )}
        />
      </Section>

      <Section as="fieldset">
        <legend>
          <Title element="h3">Hva er dere interessert i?</Title>
        </legend>
        <Text>
          Gjerne utdyp om dere har noen tanker om hvordan et arrangement kan se ut eller annet relevant. Still også
          spørsmål om dere lurer på noe.
        </Text>

        <Textarea rows={10} {...register("comment")} />
      </Section>
    </>
  )
}
