import type { DBHandle } from "@dotkomonline/db"
import mustache from "mustache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import type { EmailService } from "../../email/email-service"
import { emails } from "../../email/email-template"
import type { Group } from "../../group/group"
import type { User } from "../../user/user"
import type { UserService } from "../../user/user-service"
import type { Mark, PersonalMark } from "../mark"
import type { MarkService } from "../mark-service"
import type { PersonalMarkRepository } from "../personal-mark-repository"
import { getPersonalMarkService } from "../personal-mark-service"

const now = new Date("2026-10-20T12:00:00.000Z")
const userId = "user-one"

function createAward(id: string, weight: number, duration = 14, createdAt = now) {
  const mark: Mark = {
    id,
    title: `Reason for ${id}`,
    details: null,
    weight,
    duration,
    type: "MANUAL",
    groups: [],
    createdAt,
    updatedAt: createdAt,
  }
  const personalMark: PersonalMark = { markId: id, userId, givenById: null, createdAt }
  return { mark, personalMark }
}

function setup(awards: ReturnType<typeof createAward>[]) {
  const handle = mock<DBHandle>()
  const repository = mock<PersonalMarkRepository>()
  const markService = mock<MarkService>()
  const userService = mock<UserService>()
  const emailService = mock<EmailService>()
  repository.findManyByUserId.mockResolvedValue(awards.map(({ personalMark }) => personalMark))
  markService.findMany.mockImplementation(async (_, query, page) =>
    awards
      .filter(({ mark }) => query.byId?.includes(mark.id))
      .map(({ mark }) => mark)
      .slice(0, page?.take ?? 20)
  )
  markService.getById.mockImplementation(async (_, id) => {
    const award = awards.find(({ mark }) => mark.id === id)
    if (!award) throw new Error(`Unknown test mark: ${id}`)
    return award.mark
  })
  userService.getById.mockResolvedValue(mock<User>({ id: userId, email: "user@example.com" }))
  emailService.send.mockResolvedValue(undefined)
  const service = getPersonalMarkService(repository, markService, userService, emailService)

  async function notification() {
    expect(emailService.send).toHaveBeenCalledOnce()
    const call = emailService.send.mock.calls[0]
    const data = emails.RECEIVED_MARK.getSchema().parse(call[7])
    const html = mustache.render(await emails.RECEIVED_MARK.getTemplate(), data)
    expect(html).toContain("Se prikkene dine")
    expect(html).toContain('href="https://online.ntnu.no/profil"')
    expect(html).toContain('href="mailto:hs@online.ntnu.no"')
    expect(html).toContain("Hvis du mener dette er en feil,")
    expect(html).not.toContain("button-secondary")
    expect(html.match(/bgcolor="#0b5374"/g)).toHaveLength(2)
    expect(html.match(/bgcolor="#fee2e2"/g)).toHaveLength(1)
    expect(html).toContain('class="mark-card text-primary" bgcolor="#fee2e2"')
    expect(html).toContain(`<p style="margin: 0;">${data.title}</p>`)
    return { subject: call[5], data, html }
  }

  return { handle, service, markService, notification }
}

describe("personal mark notification", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })
  afterEach(() => vi.useRealTimers())

  it("reports the active weighted total and excludes expired marks", async () => {
    const awarded = createAward("new", 1)
    const context = setup([
      awarded,
      createAward("existing", 2),
      createAward("expired-suspension", 6, 14, new Date("2026-09-01T12:00:00.000Z")),
    ])
    await context.service.sendReceivedMarkEmail(context.handle, awarded.personalMark)
    const { subject, data, html } = await context.notification()
    expect(subject).toBe("Du har fått 1 prikk")
    expect(data).toMatchObject({
      markCountLabel: "1 prikk",
      totalMarkCountLabel: "3 prikker",
      isSuspension: false,
      isSuspended: false,
    })
    expect(html).toContain("Du har nå totalt 3 prikker.")
    expect(html).not.toContain("Du er suspendert")
    expect(html).not.toContain("Du har fått prikker fra:")
    expect(html).toContain("Hvis du mener dette er en feil, kan du kontakte Hovedstyret")
    expect(await context.service.findPunishmentByUserId(context.handle, userId)).toEqual({
      delay: 24,
      suspended: false,
    })
  })

  it("announces suspension when a normal mark reaches the active threshold", async () => {
    const awarded = createAward("new", 1)
    const context = setup([createAward("existing", 5), awarded])
    await context.service.sendReceivedMarkEmail(context.handle, awarded.personalMark)
    const { subject, data, html } = await context.notification()
    expect(subject).toBe("Du har fått 1 prikk")
    expect(data).toMatchObject({ totalMarkCountLabel: "6 prikker", isSuspension: false, isSuspended: true })
    expect(html).toContain("Du har fått 1 prikk for:")
    expect(html).toContain("Du er suspendert fra å melde deg på Onlines arrangementer.")
    expect(html).toContain('color: #4b5563; font-size: 14px; line-height: 22px;">Du er suspendert fra')
    expect(html).toContain('color: #4b5563; font-size: 14px; line-height: 22px;">Du har nå totalt 6 prikker.')
    expect(await context.service.findPunishmentByUserId(context.handle, userId)).toEqual({ delay: 0, suspended: true })
  })

  it("uses suspension wording for a directly awarded suspension", async () => {
    const awarded = createAward("suspension", 6)
    const context = setup([createAward("existing", 1), awarded])
    await context.service.sendReceivedMarkEmail(context.handle, awarded.personalMark)
    const { subject, data, html } = await context.notification()
    expect(subject).toBe("Du har blitt suspendert")
    expect(data).toMatchObject({ totalMarkCountLabel: "7 prikker", isSuspension: true, isSuspended: true })
    expect(data.endsAt).not.toBeNull()
    expect(html).toContain("Du har blitt suspendert for:")
    expect(html).not.toContain("Du har fått 6 prikker for:")
    expect(html).toContain("Utløpsdato:")
  })

  it("does not display the placeholder expiry date for indefinite payment suspensions", async () => {
    const awarded = createAward("payment-suspension", 6, 100_000)
    awarded.mark.type = "MISSING_PAYMENT"
    const context = setup([awarded])
    await context.service.sendReceivedMarkEmail(context.handle, awarded.personalMark)
    const { data, html } = await context.notification()
    expect(data.endsAt).toBeNull()
    expect(html).toContain("Suspensjonen gjelder inntil videre.")
    expect(html).not.toContain("Utløpsdato:")
  })

  it("still reports suspension when another mark is awarded to an already suspended user", async () => {
    const awarded = createAward("new", 2)
    const context = setup([createAward("suspension", 6, 100_000), awarded])
    await context.service.sendReceivedMarkEmail(context.handle, awarded.personalMark)
    const { subject, data, html } = await context.notification()
    expect(subject).toBe("Du har fått 2 prikker")
    expect(data).toMatchObject({ totalMarkCountLabel: "8 prikker", isSuspension: false, isSuspended: true })
    expect(html).toContain("Du har fått 2 prikker for:")
    expect(html).toContain("Du er suspendert")
  })

  it("includes active marks beyond the default twenty-record page", async () => {
    const awarded = createAward("active", 1)
    const expired = Array.from({ length: 21 }, (_, index) =>
      createAward(`expired-${index}`, 1, 14, new Date("2026-09-01T12:00:00.000Z"))
    )
    const context = setup([...expired, awarded])
    await context.service.sendReceivedMarkEmail(context.handle, awarded.personalMark)
    const { data } = await context.notification()
    expect(data.totalMarkCountLabel).toBe("1 prikk")
    expect(context.markService.findMany).toHaveBeenCalledWith(context.handle, expect.anything(), { take: 22 })
  })

  it("lists only the groups responsible for the latest award using their preferred names", async () => {
    const awarded = createAward("new", 1)
    awarded.mark.groups = [
      mock<Group>({
        abbreviation: "Bedkom",
        name: "Bedriftskomiteen",
        preferredDisplayName: "ABBREVIATION",
        email: "bedkom@example.com",
      }),
      mock<Group>({
        abbreviation: "Dotkom",
        name: "Drift og utvikling",
        preferredDisplayName: "NAME",
        email: "dotkom@example.com",
      }),
      mock<Group>({ abbreviation: "Arrangørgruppe", name: null, preferredDisplayName: "NAME", email: null }),
    ]
    const existing = createAward("existing", 2)
    existing.mark.groups = [mock<Group>({ abbreviation: "Tidligere arrangør", email: "previous@example.com" })]
    const context = setup([existing, awarded])
    await context.service.sendReceivedMarkEmail(context.handle, awarded.personalMark)
    const { data, html } = await context.notification()
    expect(data.responsibleGroups).toEqual([
      { name: "Bedkom", email: "bedkom@example.com" },
      { name: "Drift og utvikling", email: "dotkom@example.com" },
      { name: "Arrangørgruppe", email: null },
    ])
    expect(html).toContain("Du har fått prikker fra:")
    expect(html).toContain('href="mailto:bedkom@example.com"')
    expect(html).toContain('href="mailto:dotkom@example.com"')
    expect(html).toContain("<li>Arrangørgruppe</li>")
    expect(html).not.toContain("Tidligere arrangør")
    expect(html).not.toContain("previous@example.com")
    expect(html).not.toContain('mailto:"')
    expect(html).toContain("ta kontakt med de ansvarlige gruppene som er oppført ovenfor.")
  })
})
