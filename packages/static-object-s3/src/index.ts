import axios from "axios"
import { readFile } from "fs/promises"
import { PresignedPost, createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { S3Client } from "@aws-sdk/client-s3"

export async function getPresignedPostData(
  Bucket: string,
  filepath: string,
  mimeType: string,
  maxSizeMB: number
): Promise<PresignedPost> {
  const s3 = new S3Client({
    region: "eu-north-1",
  })

  return await createPresignedPost(s3, {
    Bucket,
    Key: bucketKey(filepath),
    Fields: {
      "content-type": mimeType,
    },
    Conditions: [
      ["content-length-range", 0, maxSizeMB * 1024 * 1024],
      // specify content-type to be more generic- images only
      // ["starts-with", "$Content-Type", "image/"],
    ],
  })
}

export async function uploadFile(
  bucketName: string,
  filepath: string,
  mimeType: "image/jpeg" | string,
  maxSizeMB = 10
) {
  try {
    const { url, fields } = await getPresignedPostData(bucketName, filepath, mimeType, maxSizeMB)

    const formData = Object.entries(fields).reduce((data, [key, value]) => {
      data.append(key, value)
      return data
    }, new FormData())

    const buf = await readFile(filepath)

    formData.append("file", new Blob([buf]))

    return await axios.post(url, formData)
  } catch (e) {
    throw new Error(`file (${filepath}) upload failed: ${e}`)
  }
}

function bucketKey(fullPath: string): string {
  // Find the last index of either forward slash or backslash
  const lastSlashIndex = Math.max(fullPath.lastIndexOf("/"), fullPath.lastIndexOf("\\"))

  // If neither is found, return the full path (no slashes means it's already just a file name)
  if (lastSlashIndex === -1) {
    return fullPath
  }

  // Otherwise, return the substring after the last found slash
  return fullPath.substring(lastSlashIndex + 1)
}

// const bigImg = "IMG_0283.jpeg"
// const smallImg = "IMG_0278.jpeg"

// test it
// ;(async () => {
//   const ret = await uploadFile("skog-testing", `/Users/skog/Downloads/${bigImg}`, "image/jpeg", 10)

//   console.log(ret.data)
// })()
