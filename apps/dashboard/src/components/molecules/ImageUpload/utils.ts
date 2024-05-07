import type { PercentCrop } from "react-image-crop"

export function percentToPixelCrop(crop: PercentCrop, image: HTMLImageElement) {
  return {
    x: (crop.x / 100) * image.width,
    y: (crop.y / 100) * image.height,
    width: (crop.width / 100) * image.width,
    height: (crop.height / 100) * image.height,
  }
}

export async function canvasPreview(image: HTMLImageElement, canvas: HTMLCanvasElement, crop: PercentCrop, scale = 1) {
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio
  // const pixelRatio = 1

  const pixelCrop = percentToPixelCrop(crop, image)

  console.log("pixelCrop in canvaspreview", pixelCrop)

  canvas.width = Math.floor(pixelCrop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(pixelCrop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = "high"

  const cropX = pixelCrop.x * scaleX
  const cropY = pixelCrop.y * scaleY

  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY)
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY)
  // 2) Scale the image
  ctx.scale(scale, scale)
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight)

  // console log everything that happened
  ctx.restore()
}

export async function getFileFromUrl(url: string): Promise<File> {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], "image.png", { type: "image/png" })
}

export async function getImageDimensions(file: File) {
  const img = new Image()
  img.src = URL.createObjectURL(file)
  await img.decode()
  return {
    width: img.width,
    height: img.height,
  }
}
