import * as fsp from "node:fs/promises"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { TZDate } from "@date-fns/tz"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import mustache from "mustache"
import { z } from "zod"

export type EmailType =
  | "COMPANY_COLLABORATION_RECEIPT"
  | "COMPANY_COLLABORATION_NOTIFICATION"
  | "COMPANY_INVOICE_NOTIFICATION"
  | "FEEDBACK_FORM_LINK"
  | "EVENT_ATTENDANCE"
  | "EVENT_MESSAGE"
  | "RECEIVED_MARK"
  | "QUEUE_NOTIFICATION"
  | "COMMITTEE_EMAIL_CREATED"
  | "COMMITTEE_EMAIL_CREATED_2FA_ENFORCED"
  | "BUG_REPORT"

type TemplateButtons = Record<
  string,
  {
    href: string
    label: string
  }
>

export interface EmailTemplate<TData, TType extends EmailType> {
  getSchema(): z.ZodType<TData>
  getTemplate(): Promise<string>
  // Text fields are Mustache partials, so their variables are escaped in the same render as the content.
  layout: {
    title: string
    preheader: string
    footerReason: string
    showTimezone?: boolean
  }
  getButtons?(data: TData): TemplateButtons
  type: TType
}

export type InferEmailData<TDef> = TDef extends EmailTemplate<infer TData, EmailType> ? TData : never
export type InferEmailType<TDef> = TDef extends EmailTemplate<unknown, infer TType extends EmailType> ? TType : never

export function createEmailTemplate<const TData, const TType extends EmailType>(
  definition: EmailTemplate<TData, TType>
): EmailTemplate<TData, TType> {
  return definition
}

const templates = fileURLToPath(new URL("../../../resources/email", import.meta.url))

async function getEmailPartials(): Promise<Record<string, string>> {
  const names = ["styles", "header", "footer", "event-image", "primary-button", "secondary-button"]

  const entries = await Promise.all(
    names.map(async (name) => [name, await fsp.readFile(path.join(templates, "partials", `${name}.mustache`), "utf-8")])
  )

  return Object.fromEntries(entries)
}

export async function renderEmailTemplate<TData>(
  definition: EmailTemplate<TData, EmailType>,
  data: TData
): Promise<string> {
  const [layout, content, partials] = await Promise.all([
    fsp.readFile(path.join(templates, "layout.mustache"), "utf-8"),
    definition.getTemplate(),
    getEmailPartials(),
  ])

  return mustache.render(
    layout,
    {
      ...data,
      layout: definition.layout,
      buttons: definition.getButtons?.(data),
    },
    {
      ...partials,
      content,
      title: definition.layout.title,
      preheader: definition.layout.preheader,
      footerReason: definition.layout.footerReason,
    }
  )
}

export const DEFAULT_EMAIL_SOURCE = "varslinger@online.ntnu.no"
export const DEFAULT_EMAIL_FROM = `Linjeforeningen Online <${DEFAULT_EMAIL_SOURCE}>`

export function getReplyToAddresses(addresses: string[]): string[] {
  if (addresses.length > 0) {
    return addresses
  }

  return [DEFAULT_EMAIL_SOURCE]
}

const EventImageUrlSchema = z
  .url({ protocol: /^https?$/ })
  .nullish()
  .catch(null)

export const emails = {
  COMPANY_COLLABORATION_RECEIPT: createEmailTemplate({
    type: "COMPANY_COLLABORATION_RECEIPT",
    layout: {
      title: "Kvittering for meldt interesse til Online",
      preheader: "Vi har mottatt interessen fra {{ companyName }}.",
      footerReason: "Du mottar denne e-posten fordi du har fylt inn et interesseskjema hos Linjeforeningen Online.",
    },
    getSchema: () =>
      z.object({
        companyName: z.string().min(1).max(140),
        contactName: z.string().min(1),
        contactEmail: z.email(),
        contactTel: z.string(),
        requestsCompanyPresentation: z.boolean(),
        requestsCourseEvent: z.boolean(),
        requestsTwoInOneDeal: z.boolean(),
        requestsInstagramTakeover: z.boolean(),
        requestsExcursionParticipation: z.boolean(),
        requestsCollaborationEvent: z.boolean(),
        requestsFemalesInTechEvent: z.boolean(),
        comment: z.string(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "company_collaboration_receipt.mustache"), "utf-8"),
  }),
  COMPANY_COLLABORATION_NOTIFICATION: createEmailTemplate({
    type: "COMPANY_COLLABORATION_NOTIFICATION",
    layout: {
      title: "Ny interesse fra {{ companyName }}",
      preheader: "{{ companyName }} har meldt interesse for samarbeid med Online.",
      footerReason: "Du mottar denne e-posten fordi du er registrert som medlem i Bedriftskomiteen i Online.",
    },
    getSchema: () =>
      z.object({
        companyName: z.string().min(1).max(140),
        contactName: z.string().min(1),
        contactEmail: z.email(),
        contactTel: z.string(),
        requestsCompanyPresentation: z.boolean(),
        requestsCourseEvent: z.boolean(),
        requestsTwoInOneDeal: z.boolean(),
        requestsInstagramTakeover: z.boolean(),
        requestsExcursionParticipation: z.boolean(),
        requestsCollaborationEvent: z.boolean(),
        requestsFemalesInTechEvent: z.boolean(),
        comment: z.string(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "company_collaboration_notification.mustache"), "utf-8"),
  }),
  COMPANY_INVOICE_NOTIFICATION: createEmailTemplate({
    type: "COMPANY_INVOICE_NOTIFICATION",
    layout: {
      title: "Fakturainformasjon fra {{ companyName }}",
      preheader: "{{ companyName }} har sendt inn fakturainformasjon.",
      footerReason: "Du mottar denne e-posten fordi du er registrert som medlem i Bedriftskomiteen i Online.",
    },
    getSchema: () =>
      z.object({
        companyName: z.string().min(1, "Bedriftsnavnet kan ikke være tomt"),
        organizationNumber: z.string().length(9, "Organisasjonsnummeret må være 9 siffer"),
        contactName: z.string().min(1, "Navn til kontaktperson kan ikke være tomt"),
        contactEmail: z.email("E-post adressen må være en gyldig e-post adresse"),
        contactTel: z.string().min(1, "Telefonnummeret kan ikke være tomt"),
        invoiceRelation: z.string(),
        preferredDeliveryMethod: z.string(),
        preferredPurchaseOrderNumber: z.number().nullable(),
        preferredDueDateLength: z.number(),
        comment: z.string().nullable(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "company_invoice_notification.mustache"), "utf-8"),
  }),
  FEEDBACK_FORM_LINK: createEmailTemplate({
    type: "FEEDBACK_FORM_LINK",
    layout: {
      title: "Tilbakemelding på {{ eventName }}",
      preheader: "Hva syntes du om {{ eventName }}?",
      footerReason: "Du mottar denne e-posten fordi du deltok på {{ eventName }}.",
      showTimezone: true,
    },
    getButtons: (data) => ({
      feedback: { href: data.feedbackLink, label: "Gi tilbakemelding" },
      event: { href: data.eventLink, label: "Se arrangementet" },
    }),
    getSchema: () =>
      z.object({
        eventName: z.string(),
        eventLink: z.url(),
        eventImageUrl: EventImageUrlSchema,
        feedbackLink: z.url(),
        eventStart: z
          .string()
          .transform((d) => formatDate(new TZDate(d, "Europe/Oslo"), "eeee dd. MMMM", { locale: nb })),
        feedbackDeadline: z
          .string()
          .transform((d) => formatDate(new TZDate(d, "Europe/Oslo"), "eeee dd. MMMM HH:mm", { locale: nb })),
        organizerEmail: z.email(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "feedback_form_link.mustache"), "utf-8"),
  }),
  EVENT_ATTENDANCE: createEmailTemplate({
    type: "EVENT_ATTENDANCE",
    layout: {
      title: "Du er påmeldt {{ eventName }}",
      preheader: "Påmeldingen din til {{ eventName }} er bekreftet. Vi gleder oss til å se deg!",
      footerReason: "Du mottar denne e-posten fordi du har meldt deg på {{ eventName }}.",
      showTimezone: true,
    },
    getButtons: (data) => ({
      event: { href: data.eventLink, label: "Se arrangementet" },
    }),
    getSchema: () =>
      z.object({
        eventName: z.string(),
        eventLink: z.url(),
        eventImageUrl: EventImageUrlSchema,
        deregistrationDeadline: z
          .string()
          .transform((d) => formatDate(new TZDate(d, "Europe/Oslo"), "eeee dd. MMMM HH:mm", { locale: nb })),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "event_attendance.mustache"), "utf-8"),
  }),
  EVENT_MESSAGE: createEmailTemplate({
    type: "EVENT_MESSAGE",
    layout: {
      title: "Viktig informasjon om {{ eventName }}",
      preheader: "Du har fått en melding fra arrangørene av {{ eventName }}.",
      footerReason: "Du mottar denne e-posten fordi du er påmeldt {{ eventName }}.",
      showTimezone: true,
    },
    getButtons: (data) => ({
      event: { href: data.eventLink, label: "Se arrangementet" },
    }),
    getSchema: () =>
      z.object({
        eventName: z.string(),
        eventLink: z.url(),
        eventImageUrl: EventImageUrlSchema,
        message: z.string(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "event_message.mustache"), "utf-8"),
  }),
  RECEIVED_MARK: createEmailTemplate({
    type: "RECEIVED_MARK",
    layout: {
      title:
        "{{# isSuspension }}Du har blitt suspendert{{/ isSuspension }}{{^ isSuspension }}Du har fått {{ markCountLabel }}{{/ isSuspension }}",
      preheader:
        "{{# isSuspension }}Du har blitt suspendert{{/ isSuspension }}{{^ isSuspension }}Du har fått {{ markCountLabel }}{{/ isSuspension }} for: {{ title }}.",
      footerReason: "Du mottar denne e-posten fordi du er medlem i Linjeforeningen Online.",
      showTimezone: true,
    },
    getButtons: () => ({
      rules: { href: "https://wiki.online.ntnu.no/online-info/prikkeregler/", label: "Les arrangementreglene" },
      profile: { href: "https://online.ntnu.no/profil", label: "Se prikkene dine" },
    }),
    getSchema: () =>
      z.object({
        title: z.string(),
        details: z.string().nullable(),
        markCountLabel: z.string().min(1),
        totalMarkCountLabel: z.string().min(1),
        responsibleGroups: z.array(z.object({ name: z.string(), email: z.string().nullable() })),
        isSuspension: z.boolean(),
        isSuspended: z.boolean(),
        endsAt: z
          .string()
          .transform((d) => formatDate(new TZDate(d, "Europe/Oslo"), "eeee dd. MMMM HH:mm", { locale: nb }))
          .nullable(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "received_mark.mustache"), "utf-8"),
  }),
  QUEUE_NOTIFICATION: createEmailTemplate({
    type: "QUEUE_NOTIFICATION",
    layout: {
      title: "Du har rykket frem i køen til {{ eventName }}",
      preheader: "Du er nå på {{ position }}. plass i køen til {{ eventName }}.",
      footerReason: "Du mottar denne e-posten fordi du står i kø til {{ eventName }}.",
      showTimezone: true,
    },
    getButtons: (data) => ({
      event: { href: data.eventLink, label: "Se arrangementet" },
    }),
    getSchema: () =>
      z.object({
        eventName: z.string(),
        eventLink: z.url(),
        eventImageUrl: EventImageUrlSchema,
        position: z.number(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "queue_notification.mustache"), "utf-8"),
  }),
  COMMITTEE_EMAIL_CREATED: createEmailTemplate({
    type: "COMMITTEE_EMAIL_CREATED",
    layout: {
      title: "Opprettelse av komité-e-postadresse",
      preheader: "Vi har opprettet en komité-e-postadresse for deg.",
      footerReason: "Du mottar denne e-posten fordi det er opprettet en komité-e-postadresse for deg.",
    },
    getButtons: () => ({
      gmail: { href: "https://mail.google.com/", label: "Åpne Gmail" },
    }),
    getSchema: () =>
      z.object({
        firstName: z.string().min(1),
        email: z.email(),
        password: z.string().min(1),
        dotkomLeaderName: z.string().min(1),
        committeeLeaderName: z.string().min(1),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "committee_email_created.mustache"), "utf-8"),
  }),
  COMMITTEE_EMAIL_CREATED_2FA_ENFORCED: createEmailTemplate({
    type: "COMMITTEE_EMAIL_CREATED_2FA_ENFORCED",
    layout: {
      title: "Opprettelse av komité-e-postadresse",
      preheader: "Vi har opprettet en komité-e-postadresse for deg.",
      footerReason: "Du mottar denne e-posten fordi det er opprettet en komité-e-postadresse for deg.",
    },
    getButtons: () => ({
      gmail: { href: "https://mail.google.com/", label: "Åpne Gmail" },
    }),
    getSchema: () =>
      z.object({
        firstName: z.string().min(1),
        email: z.email(),
        password: z.string().min(1),
        dotkomLeaderName: z.string().min(1),
        committeeLeaderName: z.string().min(1),
        recoveryCode: z.string().min(1),
      }),
    getTemplate: async () =>
      fsp.readFile(path.join(templates, "committee_email_created_2fa_enforced.mustache"), "utf-8"),
  }),
  BUG_REPORT: createEmailTemplate({
    type: "BUG_REPORT",
    layout: {
      title: "Vi har mottatt feilrapporten din: {{ title }}",
      preheader: "Takk for at du meldte fra om en feil på OnlineWeb.",
      footerReason: "Du mottar denne e-posten som bekreftelse på meldingen din til Dotkom.",
    },
    getSchema: () =>
      z.object({
        firstName: z.string().nullable(),
        name: z.string().nullable(),
        profileUrl: z.url(),
        title: z.string(),
        body: z.string(),
      }),
    getTemplate: async () => fsp.readFile(path.join(templates, "bug_report_form.mustache"), "utf-8"),
  }),
  // biome-ignore lint/suspicious/noExplicitAny: used for type inference only
} satisfies Record<string, EmailTemplate<any, any>>
