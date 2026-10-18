import type { Prisma } from "../"

export const ARTICLE_FIXTURE_SLUG = "online-lanserer-ny-app"

export const getArticleTagFixtures = (): Prisma.ArticleTagCreateManyInput[] => [
  { name: "App" },
  { name: "Nyheter" },
  { name: "Arrangement" },
  { name: "Nynorskdagen" },
]

export const getArticleFixtures = (): Prisma.ArticleCreateManyInput[] => [
  {
    id: "a3c8b2e1-4f5d-6a7b-8c9d-0e1f2a3b4c5d",
    slug: ARTICLE_FIXTURE_SLUG,
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
    id: "b4d9c3f2-5a6e-7b8c-9d0e-1f2a3b4c5d6e",
    slug: "sommerens-arrangementer",
    title: "Sommerens arrangementer",
    author: "Arrkom",
    photographer: "Arrkom",
    imageUrl:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/83ba291b-ae4c-44d9-a088-3f3eaed83403.png",
    excerpt: "Arrkom oppsummerer høydepunktene fra sommersemesteret.",
    content: "<p>Fra grillkvelder til fadderuke - her er høydepunktene fra sommeren.</p>",
  },
  {
    id: "3f7af5cb-ab42-451c-a5e4-b7cc51476b98",
    slug: "nynorskdagen-2026",
    title: "Nynorskdagen 2026",
    author: "Aasenkom",
    photographer: "Knud Knudsen",
    imageUrl:
      "https://cdn.online.ntnu.no/article/1792343050297-0b0f9964-57b3-43ad-b971-907266af1f08-73b1473b-fa67-4887-93ec-15a2c5b66445jpg",
    excerpt: "Nynorskdagen er kvar 12. mai og er svært viktig for nasjonen og dialektane våre.",
    content:
      "<p>Kvar 12. mai markerer me Nynorskdagen. Dagen er sett av til å feire nynorsk som eitt av dei to formelle skriftspråka i Noreg, og til å minnast arbeidet som vart gjort for å gje språket ein offisiell status.</p>",
    isFeatured: false,
    createdAt: new Date("2026-05-12T00:00:00.000Z"),
  },
]

export const getArticleTagLinkFixtures = (): Prisma.ArticleTagLinkCreateManyInput[] => [
  {
    articleId: "a3c8b2e1-4f5d-6a7b-8c9d-0e1f2a3b4c5d",
    tagName: "App",
  },
  {
    articleId: "a3c8b2e1-4f5d-6a7b-8c9d-0e1f2a3b4c5d",
    tagName: "Nyheter",
  },
  {
    articleId: "b4d9c3f2-5a6e-7b8c-9d0e-1f2a3b4c5d6e",
    tagName: "Arrangement",
  },
  {
    articleId: "3f7af5cb-ab42-451c-a5e4-b7cc51476b98",
    tagName: "Nyheter",
  },
  {
    articleId: "3f7af5cb-ab42-451c-a5e4-b7cc51476b98",
    tagName: "Nynorskdagen",
  },
]
