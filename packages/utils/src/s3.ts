import {
  DeleteObjectTaggingCommand,
  type S3Client,
  PutObjectTaggingCommand,
  GetObjectTaggingCommand,
} from "@aws-sdk/client-s3"
import { type PresignedPost, type PresignedPostOptions, createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { createCloudFrontUrl } from "./urls"

interface CreateS3PresignedPostProps {
  bucket: string
  key: string
  maxSizeKiB: number
  createdByUserId: string
  contentType?: string
  ephemeral?: boolean
  tags?: Record<string, string>
  fields?: PresignedPostOptions["Fields"]
  conditions?: PresignedPostOptions["Conditions"]
}

// Always applied; matches the Terraform lifecycle rule filter

const EPHEMERAL_TAGS: Record<string, string> = { status: "ephemeral" }
// Tags in aws have the format "key: value" in xml format, so this takes in strings and outputs them in the xml format, so you can just write "tag: myTag" for example.
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
function buildTagging(tags: Record<string, string>) {
  const tagSet = Object.entries(tags)
    .map(([k, v]) => `<Tag><Key>${escapeXml(k)}</Key><Value>${escapeXml(v)}</Value></Tag>`)
    .join("")
  return `<Tagging><TagSet>${tagSet}</TagSet></Tagging>`
}

export async function createS3PresignedPost(s3Client: S3Client, props: CreateS3PresignedPostProps) {
  const { createdByUserId, ...rest } = props
  const createdByField = { "x-amz-meta-created-by": createdByUserId }

  return await createS3PresignedPostWithoutCreatedBy(s3Client, {
    ...rest,
    fields: { ...props.fields, ...createdByField },
    // Having createdByField in conditions makes the created-by field required and required to be the same user who
    // created this post.
    conditions: [...(props.conditions ?? []), createdByField],
  })
}

export async function createS3PresignedPostWithoutCreatedBy(
  s3Client: S3Client,
  props: Omit<CreateS3PresignedPostProps, "createdByUserId">
) {
  const { ephemeral = true, tags: extraTags } = props
  const tags = {
    ...extraTags,
    ...(ephemeral ? EPHEMERAL_TAGS : {}),
  }
  const fields = {
    ...props.fields,
    ...(props.contentType ? { "content-type": props.contentType } : {}),
    ...(Object.keys(tags).length > 0 ? { tagging: buildTagging(tags) } : {}),
  }

  return await createPresignedPost(s3Client, {
    Bucket: props.bucket,
    Key: props.key,
    Fields: fields,
    Conditions: [...(props.conditions ?? []), ["content-length-range", 0, props.maxSizeKiB * 1024]],
  })
}

// Expected response: 204 No Content
export async function uploadFileToS3PresignedPost(
  awsCloudfrontUrl: string,
  presignedPost: PresignedPost,
  file: File
): Promise<string> {
  try {
    const formData = new FormData()
    for (const [key, value] of Object.entries(presignedPost.fields)) {
      formData.append(key, value)
    }

    // Append the file to the formData
    formData.append("file", file)

    const response = await fetch(presignedPost.url, {
      method: "POST",
      body: formData, // No headers needed, fetch adds the correct one for FormData
    })

    if (!response.ok) {
      throw new Error(`File upload failed with status ${response.status}: ${response.statusText}`)
    }

    // S3 returns a Location header with the url of the uploaded file
    const location = response.headers.get("Location")
    if (!location) {
      throw new Error("No location header")
    }

    return createCloudFrontUrl(awsCloudfrontUrl, presignedPost.fields.key)
  } catch (e) {
    throw new Error(`File upload failed: ${e}`)
  }
}

/**
 * Clears the ephemeral tag from the object so it is no longer eligible for lifecycle deletion
 */
export async function removeEphemeralTag(s3Client: S3Client, bucket: string, key: string): Promise<void> {
  const response = await s3Client.send(new GetObjectTaggingCommand({ Bucket: bucket, Key: key }))
  const tagSet = response?.TagSet ?? []
  const remaining = tagSet.filter(({ key, value }) => !(key && EPHEMERAL_TAGS[key] === value))

  // If there are no non-ephemeral tags, delete all tags.
  // This is preferred over putting an empty tag set on the object to avoid additional billing
  // https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-tagging.html#tagging-apis
  if (remaining.length === 0) {
    await s3Client.send(new DeleteObjectTaggingCommand({ Bucket: bucket, Key: key }))
    return
  }

  // Remove the ephemeral tags by only putting the non-ephemeral tags back on the object
  // https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutObjectTagging.html
  await s3Client.send(
    new PutObjectTaggingCommand({
      Bucket: bucket,
      Key: key,
      Tagging: { TagSet: remaining },
    })
  )
}

/**
 * Extracts the S3 object key from a CloudFront (or S3) object URL.
 * Example: https://d1.cloudfront.net/my-object.txt -> my-object.txt
 * Example: https://my-bucket.s3.amazonaws.com/my-object.txt -> my-object.txt
 */
export function getS3KeyFromUrl(url: string): string {
  return decodeURIComponent(new URL(url).pathname.slice(1))
}
