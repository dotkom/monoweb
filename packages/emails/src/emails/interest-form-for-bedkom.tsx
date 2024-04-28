import { Body, Column, Container, Head, Heading, Html, Preview, Row, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"
import type { FC } from "react"
import { z } from "zod"
import { type TemplateProps, createTemplate } from "../template"

const Props = z.object({
  companyName: z.string().min(1).max(140),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactTel: z.string(),
  requestsCompanyPresentation: z.boolean(),
  requestsCourseEvent: z.boolean(),
  requestsInstagramTakeover: z.boolean(),
  requestsTechTalksParticipation: z.boolean(),
  requestsExcursionParticipation: z.boolean(),
  requestsCollaborationEvent: z.boolean(),
  requestsFemalesInTechEvent: z.boolean(),
  comment: z.string(),
})

const InterestRow: FC<{ name: string; requested: boolean }> = ({ name, requested }) => (
  <Row>
    <Column>
      {name}: {requested ? "Ja" : "Nei"}
    </Column>
  </Row>
)

export default function InterestFormForBedkomEmail({
  companyName = "Bekk",
  contactName = "Ola Nordmann",
  contactEmail = "bekk@bekk.no",
  contactTel = "+47 123 45 678",
  requestsCompanyPresentation = true,
  requestsCourseEvent = false,
  requestsInstagramTakeover = false,
  requestsTechTalksParticipation = true,
  requestsExcursionParticipation = true,
  requestsCollaborationEvent = false,
  requestsFemalesInTechEvent = false,
  comment = "Vi er interessert i å ha samarbeid med Abakus samtidig!",
}: TemplateProps<typeof Props>) {
  return (
    <Html>
      <Head />
      <Preview>Bedriften {companyName} har meldt interesse om samarbeid</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container>
            <Heading as="h1">{companyName} har meldt interesse om samarbeid.</Heading>
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
              <InterestRow name="Instagram takeover" requested={requestsInstagramTakeover} />
              <InterestRow name="Tech Talks" requested={requestsTechTalksParticipation} />
              <InterestRow name="IT-ekskursjonen" requested={requestsExcursionParticipation} />
              <InterestRow
                name="Samarbeidsarrangement med andre linjeforeninger"
                requested={requestsCollaborationEvent}
              />
              <InterestRow name="Samarbeidsarrangement med FeminIT" requested={requestsFemalesInTechEvent} />

              <Heading as="h2">Andre kommentarer</Heading>
              <Text>{comment}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const Template = createTemplate("interest-form-for-bedkom", Props, InterestFormForBedkomEmail)
