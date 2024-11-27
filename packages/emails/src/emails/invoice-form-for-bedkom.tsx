import { Body, Column, Container, Head, Heading, Html, Preview, Row, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"
import { z } from "zod"
import { type TemplateProps, createTemplate } from "../template"

export enum InvoiceRelation {
  COMPANY_PRESENTATION = "Bedriftspresentasjon",
  COURSE_EVENT = "Kurs",
  OFFLINE_ADVERTISEMENT = "Annonse i Offline",
  JOB_LISTING = "Jobbannonse",
  EXCURSION_PARTICIPATION = "ITEX",
  OTHER = "Annet",
}

export enum DeliveryMethod {
  EMAIL = "E-post",
  POST = "Post",
  EHF = "EHF",
}

const Props = z.object({
  companyName: z.string().min(1, "Bedriftsnavnet kan ikke være tomt"),
  organizationNumber: z.string().length(9, "Organisasjonsnummeret må være 9 siffer"),
  contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
  contactEmail: z.string().email("E-post adressen må være en gyldig e-post adresse"),
  contactTel: z.string().min(1, "Telefonnummeret kan ikke være tomt"),
  invoiceRelation: z.nativeEnum(InvoiceRelation),
  preferredDeliveryMethod: z.nativeEnum(DeliveryMethod),
  preferredPurchaseOrderNumber: z.number().nullable(),
  preferredDueDateLength: z.number(),
  comment: z.string().nullable(),
})

export default function InvoiceFormForBedkom({
  companyName = "Bekk",
  contactName = "Ola Nordmann",
  contactEmail = "bekk@bekk.no",
  contactTel = "+47 123 45 678",
  invoiceRelation = InvoiceRelation.COMPANY_PRESENTATION,
  preferredDeliveryMethod = DeliveryMethod.EHF,
  preferredPurchaseOrderNumber = null,
  preferredDueDateLength = 14,
  organizationNumber = "123456789",
  comment = "Det kan hende økonomiavdelingen vår er litt trege til å svare",
}: TemplateProps<typeof Props>) {
  return (
    <Html>
      <Head />
      <Preview>Bedriften {companyName} har sendt inn fakturainformasjon</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container>
            <Heading as="h1">{companyName} har sendt inn fakturainformasjon.</Heading>
            <Section>
              <Row>
                <Column style={{ width: "28ch" }}>Organisasjonsnummer</Column>
                <Column>{organizationNumber}</Column>
              </Row>
              <Row>
                <Column style={{ width: "28ch" }}>Bedriftsnavn</Column>
                <Column>{companyName}</Column>
              </Row>
            </Section>

            <Section>
              <Row>
                <Column style={{ width: "28ch" }}>Bedriftens kontaktperson</Column>
                <Column>{contactName}</Column>
              </Row>
              <Row>
                <Column style={{ width: "28ch" }}>E-post adresse kontaktperson</Column>
                <Column>{contactEmail}</Column>
              </Row>
              <Row>
                <Column style={{ width: "28ch" }}>Telefonnummer kontaktperson</Column>
                <Column>{contactTel}</Column>
              </Row>
            </Section>

            <Section>
              <Row>
                <Column style={{ width: "28ch" }}>Anledning</Column>
                <Column>{invoiceRelation}</Column>
              </Row>
              <Row>
                <Column style={{ width: "28ch" }}>Foretrukket leveringsmetode</Column>
                <Column>{preferredDeliveryMethod}</Column>
              </Row>
              <Row>
                <Column style={{ width: "28ch" }}>Foretrukket bestillingsnummer</Column>
                <Column>{preferredPurchaseOrderNumber ?? "Ingen preferanse"}</Column>
              </Row>
              <Row>
                <Column style={{ width: "28ch" }}>Foretrukket forfallsdato</Column>
                <Column>{preferredDueDateLength} dager</Column>
              </Row>

              <Heading as="h2">Andre kommentarer</Heading>
              <Text>{comment}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const Template = createTemplate("invoice-form-for-bedkom", Props, InvoiceFormForBedkom)
