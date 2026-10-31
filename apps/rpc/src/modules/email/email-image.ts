import { createHash } from "node:crypto"
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3"
import { getLogger } from "@dotkomonline/logger"
import sharp from "sharp"

const EMAIL_IMAGE_BACKGROUND = "#f3f4f6"

export async function resizeEmailImage(originalImageBuffer: Uint8Array): Promise<Buffer> {
  return await sharp(originalImageBuffer)
    .autoOrient()
    .resize(1200, 450, {
      fit: "contain",
      background: EMAIL_IMAGE_BACKGROUND,
    })
    .flatten({ background: EMAIL_IMAGE_BACKGROUND })
    .jpeg({ quality: 85 })
    .toBuffer()
}

export interface EmailImageService {
  getImageUrl(originalImageUrl: string | null | undefined): Promise<string | null>
}

export function getEmailImageService(
  storageClient: S3Client,
  storageBucketName: string,
  cloudFrontUrl: string
): EmailImageService {
  const logger = getLogger("email-image")
  const cloudFrontOrigin = new URL(cloudFrontUrl).origin

  return {
    async getImageUrl(originalImageUrl) {
      if (!originalImageUrl) {
        return null
      }

      try {
        const originalUrl = new URL(originalImageUrl)
        // Read our own bucket directly instead of fetching arbitrary URLs from email payloads.
        if (originalUrl.origin !== cloudFrontOrigin) {
          throw new Error("Event image does not belong to the configured CDN")
        }

        // Event uploads have unique keys. Version the transformation so changes get a new CDN URL.
        const imageHash = createHash("sha256").update(originalImageUrl).digest("hex")
        const imageKey = `email/event-images/v1/${imageHash}.jpg`
        const imageUrl = new URL(imageKey, `${cloudFrontOrigin}/`).toString()
        const abortSignal = AbortSignal.timeout(10_000)

        try {
          await storageClient.send(new HeadObjectCommand({ Bucket: storageBucketName, Key: imageKey }), { abortSignal })
          return imageUrl
        } catch (error) {
          if (!(error instanceof Error) || error.name !== "NotFound") {
            throw error
          }
        }

        const originalImage = await storageClient.send(
          new GetObjectCommand({
            Bucket: storageBucketName,
            Key: decodeURIComponent(originalUrl.pathname.slice(1)),
          }),
          { abortSignal }
        )

        if (!originalImage.Body) {
          throw new Error("Event image has no body")
        }

        const resizedImage = await resizeEmailImage(await originalImage.Body.transformToByteArray())
        await storageClient.send(
          new PutObjectCommand({
            Bucket: storageBucketName,
            Key: imageKey,
            Body: resizedImage,
            ContentType: "image/jpeg",
            CacheControl: "public, max-age=31536000, immutable",
          }),
          { abortSignal }
        )

        return imageUrl
      } catch (error) {
        // A missing or invalid image must not prevent registration confirmations from being sent.
        logger.warn("Omitting event image from email because image preparation failed: %o", error)
        return null
      }
    },
  }
}
