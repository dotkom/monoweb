import { cp, mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { type InferEmailData, emails, renderEmailTemplate } from "../modules/email/email-template"

const outputDirectory = fileURLToPath(new URL("../../dist/email-previews/", import.meta.url))

const eventData = {
  eventName: "Bedriftspresentasjon med Online AS",
  eventLink: "https://online.ntnu.no/arrangementer/online-as",
  eventImageUrl: "https://e0.365dm.com/23/06/1600x900/skysports-arsenal-fixtures_6186945.jpg",
}

const companyContactData = {
  companyName: "Online AS",
  contactName: "John Cena",
  contactEmail: "cena@online.ntnu.no",
  contactTel: "+47 123 45 678",
}

const companyCollaborationData = {
  ...companyContactData,
  requestsCompanyPresentation: true,
  requestsCourseEvent: false,
  requestsTwoInOneDeal: true,
  requestsInstagramTakeover: false,
  requestsExcursionParticipation: true,
  requestsCollaborationEvent: false,
  requestsFemalesInTechEvent: true,
  comment:
    "<p>Vi ønsker å møte informatikkstudentene og fortelle om sommerjobber.</p><p>Vi har mange spennende muligheter for studenter.</p>",
}

const committeeEmailData = {
  firstName: "Brage",
  email: "brage@online.ntnu.no",
  password: "abcd1234",
  dotkomLeaderName: "John Cena",
  committeeLeaderName: "Steve Austin",
}

// Every template must have sample data matching its definition.
const sampleData = {
  COMPANY_COLLABORATION_RECEIPT: companyCollaborationData,
  COMPANY_COLLABORATION_NOTIFICATION: companyCollaborationData,
  COMPANY_INVOICE_NOTIFICATION: {
    ...companyContactData,
    organizationNumber: "123456789",
    invoiceRelation: "Bedriftspresentasjon i november",
    preferredDeliveryMethod: "E-post",
    preferredPurchaseOrderNumber: 123,
    preferredDueDateLength: 30,
    comment: "Merk fakturaen med bestillingsnummeret.",
  },
  FEEDBACK_FORM_LINK: {
    ...eventData,
    feedbackLink: "https://online.ntnu.no/tilbakemelding/eksempel",
    eventStart: "2026-11-12T16:00:00Z",
    feedbackDeadline: "2026-11-19T22:59:00Z",
    organizerEmail: "bedkom@online.ntnu.no",
  },
  EVENT_ATTENDANCE: {
    ...eventData,
    deregistrationDeadline: "2026-11-10T12:00:00Z",
  },
  EVENT_MESSAGE: {
    ...eventData,
    message: "<p>Velkommen til bedriftspresentasjonen!</p><p>Vi møtes ved hovedinngangen klokken 17.00.</p>",
  },
  RECEIVED_MARK: {
    title: "Manglende tilbakemelding",
    details: "Tilbakemeldingsskjemaet ble ikke besvart innen fristen.",
    markCountLabel: "2 prikker",
    totalMarkCountLabel: "3 prikker",
    responsibleGroups: [
      {
        name: "Bedriftskomiteen",
        email: "bedkom@online.ntnu.no",
      },
    ],
    isSuspension: false,
    isSuspended: false,
    endsAt: "2026-11-26T16:00:00Z",
  },
  QUEUE_NOTIFICATION: {
    ...eventData,
    position: 2,
  },
  COMMITTEE_EMAIL_CREATED: committeeEmailData,
  COMMITTEE_EMAIL_CREATED_2FA_ENFORCED: {
    ...committeeEmailData,
    recoveryCode: "1234-5678",
  },
  BUG_REPORT: {
    profileUrl: "https://online.ntnu.no/profil/dotkom",
    firstName: "Brage",
    name: "Brage Andreas Hoven",
    title: "Påmeldingsknappen mangler",
    body: "<p>Påmeldingsknappen vises ikke på arrangementssiden.</p><p>Det er ingen påmeldingsknapp på arrangementssiden bro.</p><p>Fiks det greiene der så jeg kan melde meg på</p>",
  },
} satisfies { [TemplateType in keyof typeof emails]: InferEmailData<(typeof emails)[TemplateType]> }

await mkdir(outputDirectory, { recursive: true })

// We copy the email icons to the dist directory so we can serve them locally without needing to have them in prod
await cp(new URL("../../../web/public/email-icons/", import.meta.url), join(outputDirectory, "email-icons"), {
  recursive: true,
})

async function writePreview(filename: string, html: string): Promise<void> {
  await writeFile(
    join(outputDirectory, filename),
    // We use the local paths to the icons we just copied instead of the regular production URLs
    html.replaceAll("https://online.ntnu.no/email-icons/", "email-icons/"),
    "utf-8"
  )
}

const previews: { filename: string; label: string }[] = []

for (const definition of Object.values(emails)) {
  const data = definition.getSchema().parse(sampleData[definition.type])
  const html = await renderEmailTemplate(definition, data)
  const filename = `${definition.type.toLowerCase()}.html`

  await writePreview(filename, html)

  previews.push({
    filename,
    label: definition.type,
  })
}

// Generate both versions of the suspension email
for (const isIndefiniteSuspension of [false, true]) {
  const suspensionData = {
    ...sampleData.RECEIVED_MARK,
    title: "Suspensjon for manglende betaling",
    details: "Betalingen for arrangementet ble ikke gjennomført innen fristen.",
    markCountLabel: "6 prikker",
    totalMarkCountLabel: "7 prikker",
    isSuspension: true,
    isSuspended: true,
    endsAt: isIndefiniteSuspension ? null : sampleData.RECEIVED_MARK.endsAt,
  } satisfies InferEmailData<typeof emails.RECEIVED_MARK>
  const data = emails.RECEIVED_MARK.getSchema().parse(suspensionData)

  const filename = `received_mark_suspension_${isIndefiniteSuspension ? "indefinite" : "temporary"}.html`
  const html = await renderEmailTemplate(emails.RECEIVED_MARK, data)

  await writePreview(filename, html)

  previews.push({
    filename,
    label: `RECEIVED_MARK (${isIndefiniteSuspension ? "indefinite" : "temporary"} suspension)`,
  })
}

console.log(`Generated ${previews.length} email previews at ${outputDirectory}`)
