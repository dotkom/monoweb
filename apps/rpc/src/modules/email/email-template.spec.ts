import { describe, expect, it } from "vitest"
import { emails, renderEmailTemplate } from "./email-template"

const eventData = {
  eventName: "Testarrangement",
  eventLink: "https://online.ntnu.no/arrangementer/test?source=email&action=view",
  eventImageUrl: "https://cdn.online.ntnu.no/event.jpg",
  deregistrationDeadline: "2026-10-25T12:00:00Z",
  feedbackLink: "https://online.ntnu.no/tilbakemelding/test",
  eventStart: "2026-10-25T12:00:00Z",
  feedbackDeadline: "2026-10-26T12:00:00Z",
  organizerEmail: "dotkom@online.ntnu.no",
  message: "Velkommen til arrangementet!",
  position: 2,
}

const sampleData = {
  ...eventData,
  companyName: "Testbedrift",
  contactName: "Ola Nordmann",
  contactEmail: "ola@example.com",
  contactTel: "12345678",
  requestsCompanyPresentation: true,
  requestsCourseEvent: false,
  requestsTwoInOneDeal: true,
  requestsInstagramTakeover: false,
  requestsExcursionParticipation: true,
  requestsCollaborationEvent: false,
  requestsFemalesInTechEvent: true,
  comment: "En merknad",
  organizationNumber: "123456789",
  invoiceRelation: "Testarrangement",
  preferredDeliveryMethod: "E-post",
  preferredPurchaseOrderNumber: 123,
  preferredDueDateLength: 30,
  firstName: "Ola",
  email: "ola@online.ntnu.no",
  password: "temporary-password",
  dotkomLeaderName: "Kari",
  committeeLeaderName: "Per",
  recoveryCode: "recovery-code",
  title: "Testmelding",
  body: "En beskrivelse av problemet",
  details: "En forklaring",
  markCountLabel: "2 prikker",
  endsAt: "2026-11-25T12:00:00Z",
}

describe("renderEmailTemplate", () => {
  it.each([
    ["COMPANY_COLLABORATION_RECEIPT", "Kvittering for meldt interesse til Online", "Hei Ola Nordmann!"],
    ["COMPANY_COLLABORATION_NOTIFICATION", "Ny interesse fra Testbedrift", "Hei Bedkom!"],
    ["COMPANY_INVOICE_NOTIFICATION", "Fakturainformasjon fra Testbedrift", "Testbedrift"],
    ["FEEDBACK_FORM_LINK", "Tilbakemelding på Testarrangement", "Gi tilbakemelding"],
    ["EVENT_ATTENDANCE", "Du er påmeldt Testarrangement", "Du kan melde deg av frem til"],
    ["EVENT_MESSAGE", "Viktig informasjon om Testarrangement", "Velkommen til arrangementet!"],
    ["RECEIVED_MARK", "Du har fått 2 prikker", "Les arrangementreglene"],
    ["QUEUE_NOTIFICATION", "Du har rykket frem i køen til Testarrangement", "Du er nå på 2. plass i køen"],
    ["COMMITTEE_EMAIL_CREATED", "Opprettelse av komité-e-postadresse", "Åpne Gmail"],
    ["COMMITTEE_EMAIL_CREATED_2FA_ENFORCED", "Opprettelse av komité-e-postadresse", "recovery-code"],
    ["BUG_REPORT", "Problem rapportert: Testmelding", "En beskrivelse av problemet"],
  ] as const)("renders %s with its title, content, and shared layout", async (type, title, content) => {
    const definition = emails[type]
    const data = definition.getSchema().parse(sampleData)
    const html = await renderEmailTemplate(definition, data)

    expect(html).toContain(`<title>${title}</title>`)
    expect(html).toContain(content)
    expect(html.match(/<!DOCTYPE html>/g)).toHaveLength(1)
    expect(html.match(/alt="Online"/g)).toHaveLength(2)
    expect(html.match(/Org\. nr\. 992 548 045/g)).toHaveLength(1)
    expect(html).toContain("@media (prefers-color-scheme: dark)")
    expect(html).toContain("<!--[if mso]>")
    expect(html).not.toContain("{{")
  })

  it("escapes content and layout text once without interpreting user text as a template", async () => {
    const html = await renderEmailTemplate(emails.EVENT_MESSAGE, {
      ...eventData,
      eventName: "Kurs & <middag> {{ companyName }}",
      message: "<script>alert('test')</script>\nAndre linje & mer tekst",
    })

    expect(html).toContain("<title>Viktig informasjon om Kurs &amp; &lt;middag&gt; {{ companyName }}</title>")
    expect(html).toContain("Du har fått en melding fra arrangørene av Kurs &amp; &lt;middag&gt; {{ companyName }}.")
    expect(html).toContain("Du mottar denne e-posten fordi du er påmeldt Kurs &amp; &lt;middag&gt; {{ companyName }}.")
    expect(html).toContain("&lt;script&gt;alert(&#39;test&#39;)&lt;&#x2F;script&gt;\nAndre linje &amp; mer tekst")
    expect(html).toContain(
      'href="https:&#x2F;&#x2F;online.ntnu.no&#x2F;arrangementer&#x2F;test?source&#x3D;email&amp;action&#x3D;view"'
    )
    expect(html).not.toContain("&amp;amp;")
    expect(html).not.toContain("<script>")
  })

  describe.each([
    "EVENT_ATTENDANCE",
    "EVENT_MESSAGE",
    "FEEDBACK_FORM_LINK",
    "QUEUE_NOTIFICATION",
  ] as const)("%s event image", (type) => {
    it.each([
      undefined,
      null,
      "https://cdn.online.ntnu.no/event.jpg",
    ])("handles image URL %s", async (eventImageUrl) => {
      const definition = emails[type]
      const data = definition.getSchema().parse({ ...eventData, eventImageUrl })
      const html = await renderEmailTemplate(definition, data)

      if (eventImageUrl) {
        expect(html).toContain('alt="Testarrangement" width="570"')
        expect(html).toContain("event.jpg")
      } else {
        expect(html).not.toContain('alt="Testarrangement" width="570"')
        expect(html).not.toContain("event.jpg")
      }
    })
  })

  it("preserves both feedback buttons and the optional timezone footer", async () => {
    const feedback = await renderEmailTemplate(emails.FEEDBACK_FORM_LINK, eventData)
    const committee = await renderEmailTemplate(emails.COMMITTEE_EMAIL_CREATED, sampleData)

    expect(feedback).toMatch(
      /href="https:&#x2F;&#x2F;online\.ntnu\.no&#x2F;tilbakemelding&#x2F;test"[^>]*>Gi tilbakemelding/
    )
    expect(feedback).toMatch(/class="button-secondary" href="[^"]*arrangementer[^"]*"[^>]*>Se arrangementet/)
    expect(feedback).toContain("Alle datoer er i norsk tid.")
    expect(committee).not.toContain("Alle datoer er i norsk tid.")
    expect(committee).toContain("det er opprettet en komité-e-postadresse for deg.")
  })

  it.each([null, "En forklaring"])("preserves optional mark details %s", async (details) => {
    const html = await renderEmailTemplate(emails.RECEIVED_MARK, { ...sampleData, details })

    expect(html.includes("En forklaring")).toBe(details !== null)
    expect(html).toContain("Du har fått 2 prikker for: Testmelding.")
    expect(html).toContain("Se profilen din")
  })
})
