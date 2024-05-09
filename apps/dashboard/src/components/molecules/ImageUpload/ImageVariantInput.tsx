"use client"

// https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o?file=%2Fsrc%2FApp.tsx%3A183%2C1-185%2C1
import type React from "react"
import { useRef, useState } from "react"

import type { ImageVariant } from "@dotkomonline/types"
import { useDisclosure } from "@mantine/hooks"
import { useEffect } from "react"
import type { ReactNode } from "react"
import type { PercentCrop } from "react-image-crop"
import {
  useCreateImageVariantMutation,
  useUpdateImageVariantMutation,
} from "../../../modules/asset/mutations"
import { buildAssetUrl } from "../../../utils/s3"
import { CropComponent } from "./CropComponent"
import { CropPreview } from "./CropPreview"
import { imageUploadNotifications } from "./notifications"
import { getFileFromUrl, getImageDimensions, mapCropToFrontend, percentToPixelCrop } from "./utils"

interface Props {
  setImageVariant: (image: ImageVariant | null) => void
  imageVariant: ImageVariant | null
  cropAspectLock?: number | undefined
  error?: ReactNode
}

export default function ImageVariantInput({ setImageVariant, cropAspectLock, imageVariant, error }: Props) {
  const [imgSrc, setImgSrc] = useState("")
  const [scale, setScale] = useState(1)
  const [completedCrop, setCompletedCrop] = useState<PercentCrop | undefined>(mapCropToFrontend(imageVariant))

  const [cropOpen, { toggle: toggleShowCrop }] = useDisclosure()
  const imgRef = useRef<HTMLImageElement>(null)

  const uploadToS3 = useUploadImageAssetToS3()
  const createImageVariant = useCreateImageVariantMutation()
  const updateImageVariant = useUpdateImageVariantMutation()

  async function reset() {
    setImageVariant(null)
  }

  useEffect(() => {
    if (imageVariant) {
      loadFileFromAssetKey(imageVariant.asset.key)
    }
  }, [imageVariant])

  async function loadFileFromAssetKey(assetKey: string) {
    const url = buildAssetUrl(assetKey)
    const file = await getFileFromUrl(url)
    const reader = new FileReader()
    reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""))
    reader.readAsDataURL(file)
  }

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const notify = imageUploadNotifications.fileUpload

    setCompletedCrop(undefined)
    notify.uploadS3()

    const dimensions = await getImageDimensions(e.target.files[0])
    const uploadedRawAsset = await uploadToS3(e.target.files[0], {
      width: dimensions.width,
      height: dimensions.height,
      altText: "Uploaded image",
    })
    notify.syncBackend()
    await loadFileFromAssetKey(uploadedRawAsset.key)

    const newImageVariant = {
      assetKey: uploadedRawAsset.key,
      crop: null,
      altText: "Uploaded image",
    }

    if (!imageVariant) {
      // Create new image
      const res = await createImageVariant.mutateAsync(newImageVariant)
      setImageVariant(res)
      notify.complete()
      return
    }

    // Update existing image
    const res = await updateImageVariant.mutateAsync({ id: imageVariant.id, image: newImageVariant })
    setImageVariant(res)

    notify.complete()
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
    if (!imageVariant) {
      throw new Error("Invalid state. ImageVariant value not set at crop time")
    }

    const result = await updateImageVariant.mutateAsync({
      id: imageVariant.id,
      image: {
        assetKey: imageVariant.asset.key,
        crop: getRealSizeCropValues(),
      },
    })

    toggleShowCrop()
    setImageVariant(result)
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!imageVariant && <input type="file" accept="image/*" onChange={onSelectFile} />}
      <div>
        {!!imageVariant && (
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
                  aspect={cropAspectLock}
                  scale={scale}
                />
                <button type="button" onClick={onSetCrop}>
                  Lagre
                </button>
              </div>
            )}
            {!cropOpen && !!imageVariant && (
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
