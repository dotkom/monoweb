import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3"
import sharp from "sharp"
import { describe, expect, it } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { getEmailImageService, resizeEmailImage } from "./email-image"

describe("resizeEmailImage", () => {
  it.each([
    [300, 600, 10, 225],
    [1200, 200, 600, 10],
  ])("contains a %s × %s image without stretching", async (width, height, paddingColumn, paddingRow) => {
    const originalImage = await sharp({ create: { width, height, channels: 3, background: "#ff0000" } })
      .png()
      .toBuffer()
    const resizedImage = await resizeEmailImage(originalImage)
    const metadata = await sharp(resizedImage).metadata()

    expect(metadata).toMatchObject({ width: 1200, height: 450, format: "jpeg" })

    const centerPixel = await sharp(resizedImage).extract({ left: 600, top: 225, width: 1, height: 1 }).raw().toBuffer()
    const paddingPixel = await sharp(resizedImage)
      .extract({ left: paddingColumn, top: paddingRow, width: 1, height: 1 })
      .raw()
      .toBuffer()

    expect(centerPixel[0]).toBeGreaterThan(250)
    expect(centerPixel[1]).toBeLessThan(5)
    expect(centerPixel[2]).toBeLessThan(5)
    for (const [channelIndex, expectedValue] of [243, 244, 246].entries()) {
      expect(Math.abs(paddingPixel[channelIndex] - expectedValue)).toBeLessThanOrEqual(3)
    }
  })

  it("flattens transparent images onto the same gray background", async () => {
    const originalImage = await sharp({
      create: { width: 100, height: 100, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .png()
      .toBuffer()
    const resizedImage = await resizeEmailImage(originalImage)
    const centerPixel = await sharp(resizedImage).extract({ left: 600, top: 225, width: 1, height: 1 }).raw().toBuffer()

    for (const [channelIndex, expectedValue] of [243, 244, 246].entries()) {
      expect(Math.abs(centerPixel[channelIndex] - expectedValue)).toBeLessThanOrEqual(3)
    }
  })
})

describe("EmailImageService", () => {
  const originalImageUrl = "https://cdn.online.ntnu.no/event/original.png"

  it.each([null, undefined])("skips missing images (%s)", async (originalImageUrl) => {
    const storageClient = mockDeep<S3Client>()
    const service = getEmailImageService(storageClient, "cdn-bucket", "https://cdn.online.ntnu.no")

    expect(await service.getImageUrl(originalImageUrl)).toBeNull()
    expect(storageClient.send).not.toHaveBeenCalled()
  })

  it("reuses an existing variant without reading or resizing the original", async () => {
    const storageClient = mockDeep<S3Client>()
    storageClient.send.mockResolvedValue({})
    const service = getEmailImageService(storageClient, "cdn-bucket", "https://cdn.online.ntnu.no")

    const imageUrl = await service.getImageUrl(originalImageUrl)

    expect(imageUrl).toMatch(/^https:\/\/cdn\.online\.ntnu\.no\/email\/event-images\/v1\/[a-f0-9]{64}\.jpg$/)
    expect(storageClient.send).toHaveBeenCalledTimes(1)
    expect(storageClient.send.mock.calls[0][0]).toBeInstanceOf(HeadObjectCommand)
  })

  it("stores a resized variant on a cache miss and changes its URL when the original changes", async () => {
    const originalImage = await sharp({ create: { width: 300, height: 600, channels: 3, background: "red" } })
      .png()
      .toBuffer()
    const storageClient = mockDeep<S3Client>()
    storageClient.send
      .mockRejectedValueOnce(Object.assign(new Error("Missing"), { name: "NotFound" }))
      .mockResolvedValueOnce({ Body: { transformToByteArray: async () => originalImage } })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
    const service = getEmailImageService(storageClient, "cdn-bucket", "https://cdn.online.ntnu.no")

    const imageUrl = await service.getImageUrl(originalImageUrl)
    const updatedImageUrl = await service.getImageUrl("https://cdn.online.ntnu.no/event/updated.png")

    const originalCommand = storageClient.send.mock.calls[1][0]
    expect(originalCommand).toBeInstanceOf(GetObjectCommand)
    expect(originalCommand.input).toMatchObject({ Bucket: "cdn-bucket", Key: "event/original.png" })

    const uploadCommand = storageClient.send.mock.calls[2][0]
    expect(uploadCommand).toBeInstanceOf(PutObjectCommand)
    if (!(uploadCommand instanceof PutObjectCommand)) {
      throw new Error("Expected an image upload")
    }

    expect(uploadCommand.input).toMatchObject({
      Bucket: "cdn-bucket",
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    })
    expect(imageUrl).toBe(`https://cdn.online.ntnu.no/${uploadCommand.input.Key}`)
    expect(updatedImageUrl).not.toBe(imageUrl)
    expect(await sharp(uploadCommand.input.Body as Buffer).metadata()).toMatchObject({ width: 1200, height: 450 })
  })

  it("omits an image on storage failures so the email can still be sent", async () => {
    const storageClient = mockDeep<S3Client>()
    storageClient.send.mockRejectedValue(new Error("Access denied"))
    const service = getEmailImageService(storageClient, "cdn-bucket", "https://cdn.online.ntnu.no")

    expect(await service.getImageUrl(originalImageUrl)).toBeNull()
    expect(storageClient.send).toHaveBeenCalledTimes(1)
  })

  it("does not read images belonging to another origin", async () => {
    const storageClient = mockDeep<S3Client>()
    const service = getEmailImageService(storageClient, "cdn-bucket", "https://cdn.online.ntnu.no")

    expect(await service.getImageUrl("https://example.com/event/image.png")).toBeNull()
    expect(storageClient.send).not.toHaveBeenCalled()
  })
})
