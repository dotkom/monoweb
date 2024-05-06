"use client"

// https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o?file=%2Fsrc%2FApp.tsx%3A183%2C1-185%2C1
import type React from "react"
import { useRef, useState } from "react"

import type { PixelCrop } from "react-image-crop"
import { canvasPreview } from "./canvasPreview"
import { useDebounceEffect } from "./useDebounceEffect"

import type { Image } from "@dotkomonline/types"
import { useDisclosure } from "@mantine/hooks"
import { useEffect } from "react"
import "react-image-crop/dist/ReactCrop.css"
import { useCreateImageMutation, useUpdateImageMutation, useUploadAssetToS3 } from "../../../modules/asset/mutations"
import { buildAssetUrl } from "../../../utils/s3"
import { CropComponent } from "./CropComponent"
import { CropPreview } from "./CropPreview"
import { getFileFromUrl } from "./utils"

interface Props {
  onSubmit: (image: Image | undefined) => void
  aspect?: number | undefined
  defaultValues?: Image
}

export default function ImageUpload({ onSubmit, aspect, defaultValues }: Props) {
  console.log("defaultValues", defaultValues)
  const [imgSrc, setImgSrc] = useState("")
  const [assetId, setAssetId] = useState("")
  const [scale, setScale] = useState(1)

  const [cropOpen, { toggle: toggleShowCrop }] = useDisclosure()

  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  const uploadToS3 = useUploadAssetToS3()
  const createImage = useCreateImageMutation()
  const updateImage = useUpdateImageMutation()

  async function reset() {
    setImgSrc("")
    setAssetId("")
  }

  async function setImageFromDefaultValues(image: Image) {
    setAssetId(image.assetId)
    if (image.crop) {
      setCompletedCrop({
        x: image.crop.left,
        y: image.crop.top,
        width: image.crop.width,
        height: image.crop.height,
        unit: "px",
      })
    }

    const url = buildAssetUrl(image.assetId)
    const file = await getFileFromUrl(url)
    await loadFile(file)
  }

  useEffect(() => {
    if (defaultValues) {
      setImageFromDefaultValues(defaultValues)
    }
  }, [defaultValues])

  async function loadFile(file: File) {
    const reader = new FileReader()
    reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""))
    reader.readAsDataURL(file)
  }

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedAsset = await uploadToS3(e.target.files[0])
      console.log("uploadedAsset", uploadedAsset)
      setAssetId(uploadedAsset.id)

      const url = buildAssetUrl(uploadedAsset.id)

      console.log("url", url)

      const file = await getFileFromUrl(url)
      await loadFile(file)

      const image = {
        assetId: uploadedAsset.id,
        crop: null,
        altText: "Uploaded image",
      }

      if (defaultValues) {
        const toInsert = {
          id: defaultValues.id,
          image,
        }

        // Default values are set meaning we are updating an existing image
        console.log("toInsert", toInsert)
          const res = await updateImage.mutateAsync(toInsert)
          onSubmit(res)
        return
      }

      const res = await createImage.mutateAsync(image)
      onSubmit(res)
    }
  }

  function calculateRealCropValues() {
    if (!completedCrop || !imgRef.current) {
      return null
    }

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height

    return {
      left: completedCrop.x * scaleX,
      top: completedCrop.y * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY,
    }
  }

  async function onSetCrop() {
    toggleShowCrop()

    console.log("completedCrop", calculateRealCropValues())

    let result: Image
    if (defaultValues?.id) {
      result = await updateImage.mutateAsync({
        id: defaultValues.id,
        image: {
          assetId: assetId,
          crop: calculateRealCropValues(),
          altText: "Uploaded image",
        },
      })

      console.log("result after update", result)
    } else {
      result = await createImage.mutateAsync({
        assetId: assetId,
        crop: calculateRealCropValues(),
        altText: "Uploaded image",
      })

      console.log("result after create", result)
    }

    onSubmit(result)
  }

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale)
      }
    },
    100,
    [completedCrop, scale]
  )

  return (
    <div className="App">
      <div className="Crop-Controls">{!imgSrc && <input type="file" accept="image/*" onChange={onSelectFile} />}</div>
      {!!cropOpen && (
        <div>
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
          </div>
          <CropComponent
            imgSrc={imgSrc}
            cropDefault={completedCrop}
            setCompletedCrop={setCompletedCrop}
            aspect={aspect}
            scale={scale}
          />
          <button type="button" onClick={onSetCrop}>
            Lagre
          </button>
        </div>
      )}
      {!cropOpen && !!imgSrc && (
        <div>
          <button onClick={toggleShowCrop} type="button">
            Endre crop
          </button>
          <button onClick={reset} type="button">
            Endre bilde
          </button>
        </div>
      )}
      <CropPreview imgSrc={imgSrc} completedCrop={completedCrop} imgRef={imgRef} scale={scale} hidden={cropOpen || !imgSrc}/>
    </div>
  )
}
