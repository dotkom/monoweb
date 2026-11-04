import type { Prisma } from "../"

export const fixtureArticleSlug = {
  onlineLansererNyApp: "online-lanserer-ny-app",
  sommerensArrangementer: "sommerens-arrangementer",
  nynorskdagen2026: "nynorskdagen-2026",
} as const

export const fixtureArticleId = {
  onlineLansererNyApp: "a3c8b2e1-4f5d-6a7b-8c9d-0e1f2a3b4c5d",
  sommerensArrangementer: "b4d9c3f2-5a6e-7b8c-9d0e-1f2a3b4c5d6e",
  nynorskdagen2026: "3f7af5cb-ab42-451c-a5e4-b7cc51476b98",
} as const

export type FixtureArticleKey = keyof typeof fixtureArticleId

export const articleSlug = (key: FixtureArticleKey): string => fixtureArticleSlug[key]

export const articleId = (key: FixtureArticleKey): string => fixtureArticleId[key]

export const fixtureArticleTagName = {
  app: "App",
  nyheter: "Nyheter",
  arrangement: "Arrangement",
  nynorskdagen: "Nynorskdagen",
} as const

export type FixtureArticleTagKey = keyof typeof fixtureArticleTagName

export const articleTagName = (key: FixtureArticleTagKey): string => fixtureArticleTagName[key]

export const getArticleTagFixtures = (): Prisma.ArticleTagCreateManyInput[] => [
  { name: articleTagName("app") },
  { name: articleTagName("nyheter") },
  { name: articleTagName("arrangement") },
  { name: articleTagName("nynorskdagen") },
]

export const getArticleFixtures = (): Prisma.ArticleCreateManyInput[] => [
  {
    id: articleId("onlineLansererNyApp"),
    slug: articleSlug("onlineLansererNyApp"),
    title: "Online lanserer ny app",
    author: "Redaksjonen",
    photographer: "Foto Online",
    imageUrl:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/34a15dcf-66da-4ff5-9405-8e154a5bfe03.jpeg",
    excerpt: "En ny mobilapp gjør det enklere å holde oversikt over arrangementer og grupper.",
    content:
      "<p>Online har lansert en ny mobilapp som samler arrangementer, grupper og varsler på ett sted.</p><p>Appen er tilgjengelig for alle medlemmer og oppdateres fortløpende med nye funksjoner.</p>",
  },
  {
    id: articleId("sommerensArrangementer"),
    slug: articleSlug("sommerensArrangementer"),
    title: "Sommerens arrangementer",
    author: "Arrkom",
    photographer: "Arrkom",
    imageUrl:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/83ba291b-ae4c-44d9-a088-3f3eaed83403.png",
    excerpt: "Arrkom oppsummerer høydepunktene fra sommersemesteret.",
    content: "<p>Fra grillkvelder til fadderuke - her er høydepunktene fra sommeren.</p>",
  },
  {
    id: articleId("nynorskdagen2026"),
    slug: articleSlug("nynorskdagen2026"),
    title: "Nynorskdagen 2026",
    author: "Aasenkom",
    photographer: "Knud Knudsen",
    imageUrl:
      "https://cdn.online.ntnu.no/article/1792343050297-0b0f9964-57b3-43ad-b971-907266af1f08-73b1473b-fa67-4887-93ec-15a2c5b66445jpg",
    excerpt: "Nynorskdagen er kvar 12. mai og er svært viktig for nasjonen og dialektane våre.",
    content:
      "<p>Kvar 12. mai markerer me Nynorskdagen. Dagen er sett av til å feire nynorsk som eitt av dei to formelle skriftspråka i Noreg, og til å minnast arbeidet som vart gjort for å gje språket ein offisiell status.</p>",
    createdAt: new Date("2026-05-12T00:00:00.000Z"),
  },
]

export const getArticleTagLinkFixtures = (): Prisma.ArticleTagLinkCreateManyInput[] => [
  {
    articleId: articleId("onlineLansererNyApp"),
    tagName: articleTagName("app"),
  },
  {
    articleId: articleId("onlineLansererNyApp"),
    tagName: articleTagName("nyheter"),
  },
  {
    articleId: articleId("sommerensArrangementer"),
    tagName: articleTagName("arrangement"),
  },
  {
    articleId: articleId("nynorskdagen2026"),
    tagName: articleTagName("nyheter"),
  },
  {
    articleId: articleId("nynorskdagen2026"),
    tagName: articleTagName("nynorskdagen"),
  },
]
