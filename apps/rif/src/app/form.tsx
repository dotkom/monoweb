"use client"

import { type FC } from "react"
import { Checkbox, Label, Text, Textarea, TextInput, Title } from "@dotkomonline/ui"
import { Controller, useFormContext } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"
import { CustomErrorMessage } from "./custom-error-message"
import { type FormSchema } from "./form-schema"
import { CheckboxWithTooltip } from "./checkbox"
import { Section } from "../components/section"

const instagramTakeoverTooltip = (
  <Section>
    <Text>
      En takeover på Onlines bedriftsinstagram (@onlinebedrift) gir anledning for å legge ut stories på brukeren gjennom
      en hel dag.Dette gir god mulighet for å gi innblikk i bedriften og vise hva ansatte gjør i løpet av en dag, samt
      interagere med studentene via spørsmålsrunder.
    </Text>
    <Text>
      Etter takeover er ferdig vil alt innhold bli liggende på profilen, slik at studenter til enhver tid har tilgang
      til innholdet.
    </Text>
  </Section>
)

const excursionTooltip = (
  <Section>
    <Text>
      I månedsskiftet august/september arrangeres den årlige IT-ekskursjonen til Oslo for masterstudenter i informatikk
      ved NTNU for å besøke bedrifter. Formålet er å reise på besøk til spennende og aktuelle IT-bedrifter for å få
      bedre kjennskap og forhold til potensielle arbeidsgivere.
    </Text>
    <Text>
      Det arrangeres 2 bedriftsbesøk hver dag, hvor det vil være to eller tre besøk studentene kan velge mellom på
      dagtid, og to på kveldstid. På besøkene vil studentene bli jevnt fordelt mellom bedriftene.
    </Text>
    <Text>
      Under besøket vil dere som bedrift stå fritt til å velge hva slags opplegg dere ønsker å gjennomføre. Det kan være
      bedriftspresentasjoner, faglige kurs, casearbeid, konkurranser, sosiale aktiviteter, eller annet som kan gi
      innsikt i hvordan det er å jobbe hos dere. I tillegg ønsker vi å spise et måltid sammen med dere.
    </Text>
  </Section>
)

const techTalksTooltip = (
  <Section>
    <Text>
      Tech Talks har den hensikt å være et faglig arrangement for inspirasjon og faglig påfyll fra næringslivet. I
      tillegg skal det gi inntekt til ekskursjonskomiteen som arrangerer den årlige ekskursjonen for
      informatikkstudentene ved NTNU.
    </Text>
    <Text>Arrangementet pleier å finne sted en gang i midten av februar.</Text>
    <Text>
      Arrangementet er lagt opp slik at flere bedrifter holder foredrag, workshops og lyntaler hvor de kan få presentert
      seg selv og vise fram sin faglige styrke. Dette vil være spredt utover hele dagen på et frokostseminar,
      lunsj-event eller kvelds-event. Formatet på arrangementet kan variere fra år til år. Vi begynner å kontakte
      aktuelle bedrifter på slutten av høstsemesteret.
    </Text>
  </Section>
)

const femalesInTechTooltip = (
  <Section>
    <Text>
      FeminITs rolle i Online er å fremme fellesskap og nettverksbygging blant jenter og ikke-binære studenter. Våre
      samarbeidsarrangementer er designet for å ikke bare inspirere, men også for å gi innsikt i realitetene jenter står
      overfor i IT-bransjen. Vi ønsker å fremme relevante temaer, bidra til å styrke kompetanse og motivere gjennom å
      dele verdifulle perspektiver.
    </Text>
  </Section>
)

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
          E-postadresse
          <TextInput placeholder="ola.nordmann@bedrift.no" type="email" {...register("contactEmail")} />
          <ErrorMessage name="contactEmail" errors={formState.errors} render={CustomErrorMessage} />
        </Label>

        <Label>
          Telefonnummer
          <TextInput placeholder="+47 444 99 555" type="tel" {...register("contactTel")} />
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

        <CheckboxWithTooltip
          name="requestsInstagramTakeover"
          label="Instagram Takeover"
          tooltip={instagramTakeoverTooltip}
        />
        <CheckboxWithTooltip name="requestsTechTalksParticipation" label="Tech Talks" tooltip={techTalksTooltip} />
        <CheckboxWithTooltip name="requestsExcursionParticipation" label="IT-ekskursjonen" tooltip={excursionTooltip} />
        <CheckboxWithTooltip
          name="requestsFemalesInTechEvent"
          label="Samarbeidsarrangement med FeminIT"
          tooltip={femalesInTechTooltip}
        />

        <Controller
          control={control}
          name="requestsCollaborationEvent"
          render={({ field }) => (
            <Checkbox
              label="Samarbeidsarrangement med andre linjeforeninger"
              onCheckedChange={field.onChange}
              checked={field.value}
            />
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
        <Text>Dersom dere er interessert i samarbeid med andre linjeforeninger, gjerne spesifiser hvilke(n).</Text>

        <Textarea {...register("comment")} />
      </Section>
    </>
  )
}
