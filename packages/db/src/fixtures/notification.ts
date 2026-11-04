import { stripIndents } from "common-tags"
import type { Prisma } from "../"
import { articleSlug, type FixtureArticleKey } from "./article"
import { groupSlug } from "./group"
import { fixtureUserId, type FixtureUserKey } from "./user"

export const fixtureNotificationId = {
  newArticle: "n1000001-0000-4000-8000-000000000001",
  welcomeSemester: "n1000002-0000-4000-8000-000000000002",
} as const

const notificationRecipientUserKeys: FixtureUserKey[] = ["anders", "berta", "carl", "dina", "eirik", "frida"]

export const getNotificationFixtures = ({
  articleKey = "onlineLansererNyApp",
}: {
  articleKey?: FixtureArticleKey
} = {}): Prisma.NotificationCreateInput[] => [
  {
    id: fixtureNotificationId.newArticle,
    title: "Ny artikkel: Online lanserer ny app",
    shortDescription: "Les om den nye mobilappen på nettsiden.",
    content: stripIndents(`
      <p>Vi har lansert en ny mobilapp som gjør det enklere å følge med på arrangementer og grupper.</p>
      <p>Les artikkelen for å se hva som er nytt.</p>
    `),
    type: "NEW_ARTICLE",
    payloadType: "ARTICLE",
    payload: articleSlug(articleKey),
    actorGroup: { connect: { slug: groupSlug("dotkom") } },
    createdBy: { connect: { id: fixtureUserId.anders } },
    lastUpdatedBy: { connect: { id: fixtureUserId.anders } },
    recipients: {
      create: notificationRecipientUserKeys.map((userKey) => ({
        userId: fixtureUserId[userKey],
      })),
    },
  },
  {
    id: fixtureNotificationId.welcomeSemester,
    title: "Velkommen til nytt semester",
    shortDescription: "Sjekk kalenderen for kommende arrangementer.",
    content: "<p>Et nytt semester starter snart. Følg med på OW for oppdateringer.</p>",
    type: "BROADCAST",
    payloadType: "NONE",
    payload: null,
    actorGroup: { connect: { slug: groupSlug("hs") } },
    createdBy: { connect: { id: fixtureUserId.anders } },
    lastUpdatedBy: { connect: { id: fixtureUserId.anders } },
    recipients: {
      create: notificationRecipientUserKeys.slice(0, 3).map((userKey, index) => ({
        userId: fixtureUserId[userKey],
        readAt: index === 0 ? new Date() : null,
      })),
    },
  },
]
