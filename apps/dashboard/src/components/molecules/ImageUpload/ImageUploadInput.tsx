"use client"

// https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o?file=%2Fsrc%2FApp.tsx%3A183%2C1-185%2C1
import { useRef, useState } from "react"

import type { ImageAsset, ImageVariant } from "@dotkomonline/types"
import { useDisclosure } from "@mantine/hooks"
import type { ReactNode } from "react"
import { useEffect } from "react"
import type { PercentCrop } from "react-image-crop"
import { ImageAssetFromGalleryInput } from "../../../modules/asset/modals"
import {
  useCreateImageAssetMutation,
  useCreateImageVariantMutation,
  useUpdateImageVariantMutation,
} from "../../../modules/asset/mutations"
import { buildAssetUrl } from "../../../utils/s3"
import { useImageAssetCreateForm } from "../FileForm/image-asset-create-form"
import { CropComponent } from "./CropComponent"
import { CropPreview } from "./CropPreview"
import { imageUploadNotifications } from "./notifications"
import { getFileFromUrl, mapCropToFrontend, percentToPixelCrop } from "./utils"

interface Props {
  setImageVariant: (image: ImageVariant | null) => void
  imageVariant: ImageVariant | null
  cropAspectLock?: number | undefined
  error?: ReactNode
}

export default function ImageUploadInput({ setImageVariant, cropAspectLock, imageVariant, error }: Props) {
  const [imgSrc, setImgSrc] = useState("")
  const [completedCrop, setCompletedCrop] = useState<PercentCrop | undefined>(mapCropToFrontend(imageVariant))

  const [cropOpen, { toggle: toggleShowCrop }] = useDisclosure()
  const [imageFileFormOpen, { open: openImageFileForm, close: closeImageFileForm }] = useDisclosure()
  const imgRef = useRef<HTMLImageElement>(null)

  const createImageAsset = useCreateImageAssetMutation()
  const createImageVariant = useCreateImageVariantMutation()
  const updateImageVariant = useUpdateImageVariantMutation()

  const [showImageAssetGalleryPicker, { toggle: toggleShowImageAssetGalleryPicker }] = useDisclosure()

  const ImageFileForm = useImageAssetCreateForm({
    onSubmit: async (values) => {
      const notify = imageUploadNotifications.fileUpload
      setCompletedCrop(undefined)
      notify.syncBackend()
      await loadFileFromAssetKey(values.file.key)

      await createImageAsset.mutateAsync({
        key: values.file.key,
        altText: values.altText,
        photographer: values.photographer,
        title: values.title,
        tags: values.tags,
        height: values.file.height,
        width: values.file.width,
        mimeType: values.file.mimeType,
        originalFilename: values.file.originalFilename,
        size: values.file.size,
      })

      const defaultImageVariant = await createImageVariant.mutateAsync({
        assetKey: values.file.key,
        crop: null,
      })

      setImageVariant(defaultImageVariant)
      closeImageFileForm()
    },
  })

  const onImageAssetSelected = async (image: ImageAsset) => {
    setCompletedCrop(undefined)
    await loadFileFromAssetKey(image.key)

    const defaultImageVariant = await createImageVariant.mutateAsync({
      assetKey: image.key,
      crop: null,
    })

    setImageVariant(defaultImageVariant)
    toggleShowImageAssetGalleryPicker()
  }

  async function reset() {
    setImageVariant(null)
  }

  useEffect(() => {
    if (imageVariant?.asset.key) {
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

  function getRealSizeCropValues() {
    if (!completedCrop || !imgRef.current) {
      return null
    }

    const pixelCrop = percentToPixelCrop(completedCrop, imgRef.current)

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

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
      {!imageVariant && (
        <div>
          <button onClick={openImageFileForm} type="button">
            Last opp ny fil
          </button>
          <button onClick={toggleShowImageAssetGalleryPicker} type="button">
            Velg fra galleri
          </button>
        </div>
      )}

      {imageFileFormOpen && <ImageFileForm />}
      {showImageAssetGalleryPicker && <ImageAssetFromGalleryInput onSelect={onImageAssetSelected} />}

      <div>
        {!!imageVariant && (
          <>
            {cropOpen && (
              <div>
                <CropComponent
                  imgSrc={imgSrc}
                  completedCrop={completedCrop}
                  setCompletedCrop={setCompletedCrop}
                  aspect={cropAspectLock}
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
            <CropPreview imgSrc={imgSrc} completedCrop={completedCrop} imgRef={imgRef} hidden={cropOpen || !imgSrc} />
          </>
        )}
      </div>
    </div>
  )
}
