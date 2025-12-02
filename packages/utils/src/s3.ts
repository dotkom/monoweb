import type { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost, type PresignedPost, type PresignedPostOptions } from "@aws-sdk/s3-presigned-post"
import { createCloudFrontUrl } from "./urls"

interface CreateS3PresignedPostProps {
  bucket: string
  key: string
  maxSizeKiB: number
  createdByUserId: string
  contentType?: string
  fields?: PresignedPostOptions["Fields"]
  conditions?: PresignedPostOptions["Conditions"]
}

export async function createS3PresignedPost(s3Client: S3Client, props: CreateS3PresignedPostProps) {
  const conditions = props.conditions ?? []

  // https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html#UserMetadata
  const createdByField = {
    "x-amz-meta-created-by": props.createdByUserId,
  }

  return await createS3PresignedPostWithoutCreatedBy(s3Client, {
    ...props,
    fields: {
      ...props.fields,
      ...createdByField,
    },
    // Having createdByField in conditions makes the created-by field required and required to be the same user who
    // created this post.
    conditions: [...conditions, createdByField],
  })
}

export async function createS3PresignedPostWithoutCreatedBy(
  s3Client: S3Client,
  props: Omit<CreateS3PresignedPostProps, "createdByUserId">
) {
  let fields = props.fields

  if (props.contentType) {
    fields ??= {}
    fields = { ...fields, "content-type": props.contentType }
  }

  const conditions = props.conditions ?? []
  return await createPresignedPost(s3Client, {
    Bucket: props.bucket,
    Key: props.key,
    Fields: fields,
    Conditions: [...conditions, ["content-length-range", 0, props.maxSizeKiB * 1024]],
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
