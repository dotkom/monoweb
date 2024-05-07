"use client"

// https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o?file=%2Fsrc%2FApp.tsx%3A183%2C1-185%2C1
import type React from "react"
import { useRef, useState } from "react"

import type { ImageVariant } from "@dotkomonline/types"
import { useDisclosure } from "@mantine/hooks"
import { useEffect } from "react"
import type { PercentCrop } from "react-image-crop"
import {
  useCreateImageMutation,
  useUpdateImageMutation,
  useUploadImageAssetToS3,
} from "../../../modules/asset/mutations"
import { buildAssetUrl } from "../../../utils/s3"
import { CropComponent } from "./CropComponent"
import { CropPreview } from "./CropPreview"
import { getFileFromUrl, getImageDimensions, percentToPixelCrop } from "./utils"

interface Props {
  setImage: (image: ImageVariant | null) => void
  image: ImageVariant | null
  cropAspectLock?: number | undefined
}

const mapCropToFrontend = (image: ImageVariant | null): PercentCrop | undefined => {
  if (!image || !image.crop) {
    return undefined
  }

  // This is stored in pixels
  const crop = image.crop

  console.log("stored data", image)

  const percentCrop: PercentCrop = {
    x: (crop.left / image.asset.width) * 100,
    y: (crop.top / image.asset.height) * 100,
    width: (crop.width / image.asset.width) * 100,
    height: (crop.height / image.asset.height) * 100,
    unit: "%",
  }

  console.log("calcualted crop", percentCrop)

  return percentCrop
}

export default function ImageUpload({ setImage, cropAspectLock: aspect, image }: Props) {
  const [imgSrc, setImgSrc] = useState("")
  const [scale, setScale] = useState(1)
  const [completedCrop, setCompletedCrop] = useState<PercentCrop | undefined>(mapCropToFrontend(image))

  const [cropOpen, { toggle: toggleShowCrop }] = useDisclosure()
  const imgRef = useRef<HTMLImageElement>(null)

  const uploadToS3 = useUploadImageAssetToS3()
  const createImage = useCreateImageMutation()
  const updateImage = useUpdateImageMutation()

  async function reset() {
    setImage(null)
  }

  useEffect(() => {
    if (image) {
      loadFileFromAssetKey(image.asset.key)
    }
  }, [image])

  async function loadFileFromAssetKey(assetKey: string) {
    const url = buildAssetUrl(assetKey)
    const file = await getFileFromUrl(url)
    const reader = new FileReader()
    reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""))
    reader.readAsDataURL(file)
  }

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCompletedCrop(undefined)
      const dimensions = await getImageDimensions(e.target.files[0])
      console.log(dimensions)
      const uploadedRawAsset = await uploadToS3(e.target.files[0], {
        width: dimensions.width,
        height: dimensions.height,
        altText: "Uploaded image",
      })
      await loadFileFromAssetKey(uploadedRawAsset.key)

      const newImage = {
        assetKey: uploadedRawAsset.key,
        crop: null,
        altText: "Uploaded image",
      }

      if (!image) {
        // Create new image
        const res = await createImage.mutateAsync(newImage)
        setImage(res)
        return
      }

      // Update existing image
      const res = await updateImage.mutateAsync({ id: image.id, image: newImage })
      setImage(res)
      return
    }
  }

  function getRealSizeCropValues() {
    if (!completedCrop || !imgRef.current) {
      return null
    }

    const pixelCrop = percentToPixelCrop(completedCrop, imgRef.current)

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

    console.log(pixelCrop, scaleX, scaleY)

    return {
      left: pixelCrop.x * scaleX,
      top: pixelCrop.y * scaleY,
      width: pixelCrop.width * scaleX,
      height: pixelCrop.height * scaleY,
    }
  }

  async function onSetCrop() {
    if (!image) {
      throw new Error("Invalid state. ImageVariant value not set at crop time")
    }

    const result = await updateImage.mutateAsync({
      id: image.id,
      image: {
        assetKey: image.asset.key,
        crop: getRealSizeCropValues(),
      },
    })

    toggleShowCrop()
    setImage(result)
  }

  return (
    <div>
      {!image && <input type="file" accept="image/*" onChange={onSelectFile} />}
      <div>
        {!!image && (
          <>
            {cropOpen && (
              <div>
                <label htmlFor="scale-input">Scale: </label>
                <input
                  id="scale-input"
                  type="number"
                  step="0.1"
                  value={scale}
                  disabled={!imgSrc}
                  onChange={(e) => setScale(Number(e.target.value))}
                />
                <CropComponent
                  imgSrc={imgSrc}
                  completedCrop={completedCrop}
                  setCompletedCrop={setCompletedCrop}
                  aspect={aspect}
                  scale={scale}
                />
                <button type="button" onClick={onSetCrop}>
                  Lagre
                </button>
              </div>
            )}
            {!cropOpen && !!image && (
              <div>
                <button onClick={toggleShowCrop} type="button">
                  Endre crop
                </button>
                <button onClick={reset} type="button">
                  Endre bilde
                </button>
              </div>
            )}
            <CropPreview
              imgSrc={imgSrc}
              completedCrop={completedCrop}
              imgRef={imgRef}
              scale={scale}
              hidden={cropOpen || !imgSrc}
            />
          </>
        )}
      </div>
    </div>
  )
}
