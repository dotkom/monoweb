import { type PresignedPost, createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { S3Client } from "@aws-sdk/client-s3"

// export async function uploadFileBrowser(bucketName: string, file: File, maxSizeMB = 10) {
//   if (!(file instanceof File)) {
//     throw new Error("The file parameter must be an instance of File.")
//   }

//   // Check the file size against maxSizeMB
//   if (file.size > maxSizeMB * 1024 * 1024) {
//     throw new Error(`File size exceeds the maximum limit of ${maxSizeMB} MB.`)
//   }

//   try {
//     // Make sure to handle the getPresignedPostData to retrieve the URL and fields for the form
//     const { url, fields } = await getPresignedPostData(bucketName, file.name, file.type, maxSizeMB)

//     const formData = new FormData()
//     Object.entries(fields).forEach(([key, value]) => {
//       formData.append(key, value)
//     })

//     // Append the file to the formData
//     formData.append("file", file)

//     // If axios is available
//     return await axios.post(url, formData)

//     // OR, if you want to use the Fetch API instead
//     // const response = await fetch(url, {
//     //   method: 'POST',
//     //   body: formData
//     // });
//     // return await response.json();
//   } catch (e) {
//     throw new Error(`File upload failed: ${e}`)
//   }
// }

// export async function uploadFile(bucketName: string, filepath: string, mimeType: "image/jpeg", maxSizeMB = 10) {
//   try {
//     const { url, fields } = await getPresignedPostData(bucketName, filepath, mimeType, maxSizeMB)

//     const formData = Object.entries(fields).reduce((data, [key, value]) => {
//       data.append(key, value)
//       return data
//     }, new FormData())

//     const buf = await readFile(filepath)

//     formData.append("file", new Blob([buf]))

//     return await axios.post(url, formData)
//   } catch (e) {
//     throw new Error(`file (${filepath}) upload failed: ${e}`)
//   }
// }

// const bigImg = "IMG_0283.jpeg"
// const smallImg = "IMG_0278.jpeg"

// test it
// ;(async () => {
//   const ret = await uploadFile("skog-testing", `/Users/skog/Downloads/${bigImg}`, "image/jpeg", 10)

//   console.log(ret.data)
// })()

export interface S3Repository {
  getPresignedPostData(bucket: string, filename: string, mimeType: string, maxSizeMB: number): Promise<PresignedPost>
}

export class S3RepositoryImpl implements S3Repository {
  async getPresignedPostData(
    bucket: string,
    filepath: string,
    mimeType: string,
    maxSizeMB: number
  ): Promise<PresignedPost> {
    const s3 = new S3Client({
      region: "eu-north-1",
    })

    return await createPresignedPost(s3, {
      Bucket: bucket,
      Key: this.bucketKey(filepath),
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

  bucketKey(fullPath: string): string {
    // Find the last index of either forward slash or backslash
    const lastSlashIndex = Math.max(fullPath.lastIndexOf("/"), fullPath.lastIndexOf("\\"))

    // If neither is found, return the full path (no slashes means it's already just a file name)
    if (lastSlashIndex === -1) {
      return fullPath
    }

    // Otherwise, return the substring after the last found slash
    return fullPath.substring(lastSlashIndex + 1)
  }
}
