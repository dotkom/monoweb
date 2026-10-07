import { stripIndents } from "common-tags"
import type { Prisma } from "../"
import { ARTICLE_FIXTURE_SLUG } from "./article"

type NotificationFixtureInput = {
  articleSlug?: string
  createdByUserId: string
  recipientUserIds: string[]
}

export const getNotificationFixtures = ({
  articleSlug = ARTICLE_FIXTURE_SLUG,
  createdByUserId,
  recipientUserIds,
}: NotificationFixtureInput): Prisma.NotificationCreateInput[] => [
  {
    title: "Ny artikkel: Online lanserer ny app",
    shortDescription: "Les om den nye mobilappen på nettsiden.",
    content: stripIndents(`
      <p>Vi har lansert en ny mobilapp som gjør det enklere å følge med på arrangementer og grupper.</p>
      <p>Les artikkelen for å se hva som er nytt.</p>
    `),
    type: "NEW_ARTICLE",
    payloadType: "ARTICLE",
    payload: articleSlug,
    actorGroup: { connect: { slug: "dotkom" } },
    createdBy: { connect: { id: createdByUserId } },
    lastUpdatedBy: { connect: { id: createdByUserId } },
    recipients: {
      create: recipientUserIds.map((userId) => ({
        userId,
      })),
    },
  },
  {
    title: "Velkommen til nytt semester",
    shortDescription: "Sjekk kalenderen for kommende arrangementer.",
    content: "<p>Et nytt semester starter snart. Følg med på OW for oppdateringer.</p>",
    type: "BROADCAST",
    payloadType: "NONE",
    payload: null,
    actorGroup: { connect: { slug: "hs" } },
    createdBy: { connect: { id: createdByUserId } },
    lastUpdatedBy: { connect: { id: createdByUserId } },
    recipients: {
      create: recipientUserIds.slice(0, 3).map((userId, index) => ({
        userId,
        readAt: index === 0 ? new Date() : null,
      })),
    },
  },
]
