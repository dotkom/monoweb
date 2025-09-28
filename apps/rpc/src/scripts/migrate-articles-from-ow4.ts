import { TZDate } from "@date-fns/tz"
import type { DBClient } from "@dotkomonline/db"
import { marked } from "marked"
import { createConfiguration } from "src/configuration"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"
import z from "zod"
import { DEFAULT_IMAGE_URL, dumpOW4Data } from "./migrate-from-ow4"

const createUniqueSlug = async (prisma: DBClient, slug: string) => {
  let uniqueSlug = slug
  for (let i = 1; ; i++) {
    const match = await prisma.article.findUnique({ where: { slug: uniqueSlug } })
    if (match === null) {
      break
    }
    // If the slug already exists, we try something like slug-1
    uniqueSlug = `${slug}-${i}`
  }
  return uniqueSlug
}

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const OW4ImageSchema = z.object({
  original: z.string(),
  photographer: z.string(),
})

const OW4ArticleSchema = z.object({
  authors: z.string(),
  content: z.string(),
  featured: z.boolean(),
  heading: z.string(),
  ingress: z.string(),
  ingress_short: z.string(),
  published_date: z.string().transform((publishedDate) => new TZDate(publishedDate, "UTC")),
  changed_date: z.string().transform((changedDate) => new TZDate(changedDate, "UTC")),
  slug: z.string(),
  tags: z.string().array(),
  video: z.string(),
  image: OW4ImageSchema.nullable(),
})

console.log("Dumping articles")
const data = await dumpOW4Data("https://old.online.ntnu.no/api/v1/articles/?format=json")

const articles = OW4ArticleSchema.array().parse(data)
const articleService = serviceLayer.articleService

console.log("Inserting articles")

for (const article of articles) {
  console.log(`Inserting ${article.heading}`)

  const row = await prisma.article.create({
    data: {
      createdAt: article.published_date,
      updatedAt: article.changed_date,
      author: article.authors,
      content: await marked(article.content),
      excerpt: await marked(article.ingress),
      imageUrl: article.image?.original ?? DEFAULT_IMAGE_URL,
      isFeatured: article.featured,
      photographer: article.image?.photographer ?? "",
      slug: await createUniqueSlug(prisma, article.slug),
      title: article.heading,
      vimeoId: article.video,
    },
  })

  await articleService.setTags(prisma, row.id, article.tags)
}
