import type { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { TZDate } from "@date-fns/tz"
import { createConfiguration } from "src/configuration"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"
import { z } from "zod"

const SanityAssetSchema = z.object({
  asset: z.object({
    _ref: z.string(),
  }),
  _type: z.string(),
})
type SanityAsset = z.infer<typeof SanityAssetSchema>

const SanityOfflineSchema = z.object({
  title: z.string(),
  release_date: z.string().transform((publishedDate) => new TZDate(publishedDate, "UTC")),
  _createdAt: z.string().transform((publishedDate) => new TZDate(publishedDate, "UTC")),
  _updatedAt: z.string().transform((publishedDate) => new TZDate(publishedDate, "UTC")),
  pdf: SanityAssetSchema,
  thumbnail: SanityAssetSchema,
})

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const SANITY_PROJECT_ID = "wsqi2mae"
const SANITY_DATASET = "production"
const SANITY_API_VERSION = "2023-05-03"

const query = `*[_type == "offline"]`
const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(
  query
)}`

console.log("Fetching offlines from sanity")

const response = await fetch(url)
const { result } = await response.json()

const sanityOfflines = SanityOfflineSchema.array().parse(result)

console.log("Inserting offlines")

for (const sanityOffline of sanityOfflines) {
  console.log(`Uploading files for ${sanityOffline.title}`)
  const imageUrl = await uploadFile(sanityOffline.thumbnail)
  const fileUrl = await uploadFile(sanityOffline.pdf)

  console.log(`Creating ${sanityOffline.title}`)
  await serviceLayer.offlineService.create(prisma, {
    fileUrl,
    imageUrl,
    publishedAt: sanityOffline.release_date,
    title: sanityOffline.title,
    createdAt: sanityOffline._createdAt,
    updatedAt: sanityOffline._updatedAt,
  })
}

async function uploadFile(file: SanityAsset) {
  const ext = file.asset._ref.split("-").at(-1) ?? "png"
  const sanityPath = buildSanityPath(file.asset._ref, file._type)
  const filename = `offline.${ext}`

  const base = file._type === "image" ? "images" : "files"
  const assetUrl = `https://cdn.sanity.io/${base}/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${sanityPath}`

  const res = await fetch(assetUrl)
  const blob = await res.blob()
  const presignedPost = await createUploadURL(dependencies.s3Client, filename, ext)

  const formData = new FormData()
  for (const [key, value] of Object.entries(presignedPost.fields)) {
    formData.append(key, value)
  }

  formData.append("file", blob, filename)

  const response = await fetch(presignedPost.url, { method: "POST", body: formData })

  const location = response.headers.get("Location")
  if (!location) {
    throw new Error("File upload failed: No location header")
  }

  return location
}

function buildSanityPath(ref: string, type: string) {
  if (type === "image") {
    const [_, hash, dims, ext] = ref.split("-")
    return `${hash}-${dims}.${ext}`
  }

  const [_, hash, ext] = ref.split("-")
  return `${hash}.${ext}`
}

async function createUploadURL(client: S3Client, filename: string, extension: string) {
  const uuid = crypto.randomUUID()
  const mimeType = extension === "pdf" ? "application/pdf" : extension
  const basePath = extension === "pdf" ? "offlines" : ""
  const key = `${basePath}/${Date.now()}-${uuid}-${filename}`
  return await createPresignedPost(client, {
    Bucket: configuration.AWS_S3_BUCKET,
    Key: key,
    Fields: {
      "Content-Type": mimeType,
    },
  })
}
