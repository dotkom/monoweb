import type { Prisma } from "../"

export const ARTICLE_FIXTURE_SLUG = "online-lanserer-ny-app"

export const getArticleTagFixtures = (): Prisma.ArticleTagCreateManyInput[] => [
  { name: "App" },
  { name: "Nyheter" },
  { name: "Arrangement" },
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
    isFeatured: true,
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
    isFeatured: false,
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
]
