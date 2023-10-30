import React, { FC } from "react"
import { Body, Column, Container, Head, Heading, Html, Preview, Row, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"
import { z } from "zod"
import { createTemplate, TemplateProps } from "../template"

const Props = z.object({
  companyName: z.string().min(1).max(140),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactTel: z.string(),
  requestsCompanyPresentation: z.boolean(),
  requestsCourseEvent: z.boolean(),
  requestsOfflineAdvertisement: z.boolean(),
  requestsJobListing: z.boolean(),
  requestsInstagramTakeover: z.boolean(),
  requestsTechTalksParticipation: z.boolean(),
  requestsExcursionParticipation: z.boolean(),
  comment: z.string(),
})

const InterestRow: FC<{ name: string; requested: boolean }> = ({ name, requested }) => {
  return (
    <Row>
      <Column>
        {name}: {requested ? "Ja" : "Nei"}
      </Column>
    </Row>
  )
}

export default function InterestFormForCompanyEmail({
  companyName = "Bekk",
  contactName = "Ola Nordmann",
  contactEmail = "bekk@bekk.no",
  contactTel = "+47 123 45 678",
  requestsCompanyPresentation = true,
  requestsCourseEvent = false,
  requestsOfflineAdvertisement = true,
  requestsJobListing = false,
  requestsInstagramTakeover = false,
  requestsTechTalksParticipation = true,
  requestsExcursionParticipation = true,
  comment = "Vi er interessert i å ha samarbeid med Abakus samtidig!",
}: TemplateProps<typeof Props>) {
  return (
    <Html>
      <Head />
      <Preview>Du har meldt interesse til Online på vegne av {companyName}</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container>
            <Heading as="h1">Du har meldt interesse til Online på vegne av {companyName}</Heading>
            <Section>
              <Row>
                <Column>Bedriftens kontaktperson</Column>
                <Column>{contactName}</Column>
              </Row>
              <Row>
                <Column>E-post adresse kontaktperson</Column>
                <Column>{contactEmail}</Column>
              </Row>
              <Row>
                <Column>Telefonnummer kontaktperson</Column>
                <Column>{contactTel}</Column>
              </Row>

              <Heading as="h2">Meldte interesser</Heading>
              <InterestRow name="Bedriftspresentasjon" requested={requestsCompanyPresentation} />
              <InterestRow name="Kurs" requested={requestsCourseEvent} />
              <InterestRow name="Annonse i Offline" requested={requestsOfflineAdvertisement} />
              <InterestRow name="Stillingsutlysning" requested={requestsJobListing} />
              <InterestRow name="Instagram takeover" requested={requestsInstagramTakeover} />
              <InterestRow name="Tech Talks" requested={requestsTechTalksParticipation} />
              <InterestRow name="IT-ekskursjonen" requested={requestsExcursionParticipation} />

              <Heading as="h2">Andre kommentarer</Heading>
              <Text>{comment}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const Template = createTemplate("interest-form-for-company", Props, InterestFormForCompanyEmail)
