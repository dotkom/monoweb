import "server-only"
import "@aws-sdk/signature-v4-crt"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { env } from "@dotkomonline/env"

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export const uploadToStatic = async (buf: Blob, key: string) => {
  const command = new PutObjectCommand({
    Bucket: env.AWS_STATIC_BUCKET,
    Body: buf,
    Key: key,
  })

  await client.send(command)
}
