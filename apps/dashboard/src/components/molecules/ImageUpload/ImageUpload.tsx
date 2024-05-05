"use client"

// https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o?file=%2Fsrc%2FApp.tsx%3A183%2C1-185%2C1
import type React from "react"
import { useRef, useState } from "react"

import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop"
import { canvasPreview } from "./canvasPreview"
import { useDebounceEffect } from "./useDebounceEffect"

import type { Image } from "@dotkomonline/types"
import "react-image-crop/dist/ReactCrop.css"
import { useCreateImageMutation, useUpdateImageMutation, useUploadAssetToS3 } from "../../../modules/asset/mutations"
import { buildAssetUrl } from "../../../utils/s3"
import { useEffect } from "react"
import { useDisclosure } from "@mantine/hooks"

interface CropProps {
  imgSrc: string
  cropDefault?: Crop
  setCompletedCrop: (crop: PixelCrop) => void
  aspect?: number
  scale: number
}

function CropComponent({ imgSrc, cropDefault, setCompletedCrop, aspect, scale }: CropProps) {
  const [crop, setCrop] = useState<Crop | undefined>(cropDefault ?? undefined)
  const imgRef = useRef<HTMLImageElement>(null)

  // function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
  //   if (aspect) {
  //     const { width, height } = e.currentTarget
  //     setCrop(centerAspectCrop(width, height, aspect))
  //   }
  // }

  return (
    <ReactCrop
      crop={crop}
      onChange={(_, percentCrop) => setCrop(percentCrop)}
      onComplete={(c) => setCompletedCrop(c)}
      aspect={aspect}
      minHeight={100}
    >
      {/* <img ref={imgRef} alt="Crop me" src={imgSrc} style={{ transform: `scale(${scale})` }} onLoad={onImageLoad} /> */}
      <img ref={imgRef} alt="Crop me" src={imgSrc} style={{ transform: `scale(${scale})` }} />
    </ReactCrop>
  )
}

interface ShowPreviewProps {
  imgSrc: string
  completedCrop: PixelCrop
  imgRef: React.RefObject<HTMLImageElement>
  scale: number
}
function ShowPreview({ imgSrc, completedCrop, imgRef, scale }: ShowPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    ;(async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && canvasRef.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef.current, canvasRef.current, completedCrop, scale)
      }
    })()
  }, [completedCrop, scale, imgRef.current])
  return (
    <div>
      <img src={imgSrc} alt="Crop" style={{ display: "none" }} ref={imgRef} />
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid black",
          objectFit: "contain",
          // width: completedCrop.width,
          width: 200,
          // height: completedCrop.height,
        }}
      />
    </div>
  )
}

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

interface Props {
  onSubmit: (image: Image | undefined) => void
  aspect?: number | undefined
  defaultValues?: Image
}

export default function ImageUpload({ onSubmit, aspect, defaultValues }: Props) {
  const [cropOpen, { toggle: toggleShowCrop }] = useDisclosure()
  const [imgSrc, setImgSrc] = useState("")
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
  const blobUrlRef = useRef("")

  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [assetUri, setAssetId] = useState("")

  const uploadToS3 = useUploadAssetToS3()
  const createImage = useCreateImageMutation()
  const updateImage = useUpdateImageMutation()

  useEffect(() => {
    async function fetchDefaultImage() {
      if (defaultValues) {
        setAssetId(defaultValues.assetId)
        if (defaultValues.crop) {
          console.log("setting crop", defaultValues.crop)
          setCompletedCrop({
            x: defaultValues.crop.left,
            y: defaultValues.crop.top,
            width: defaultValues.crop.width,
            height: defaultValues.crop.height,
            unit: "px",
          })
        }

        const url = buildAssetUrl(defaultValues.assetId)
        const file = await getFileFromUrl(url)
        await loadFile(file)
      }
    }

    fetchDefaultImage()
  }, [defaultValues])

  async function loadFile(file: File) {
    // setCrop(undefined)
    const reader = new FileReader()
    reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""))
    reader.readAsDataURL(file)
  }

  async function getFileFromUrl(url: string): Promise<File> {
    const response = await fetch(url)
    const blob = await response.blob()
    return new File([blob], "image.png", { type: "image/png" })
  }

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const result = await uploadToS3(e.target.files[0])
      setAssetId(result.id)
      const url = buildAssetUrl(result.id)
      const file = await getFileFromUrl(url)
      await loadFile(file)

      let imgResult: Image
      const image = {
        assetId: assetUri,
        crop: getScaledCrop(),
        altText: "Uploaded image",
      }

        console.log("updating image", image)

      if (defaultValues?.id) {
        imgResult = await updateImage.mutateAsync({
          id: defaultValues.id,
          image,
        })
      } else {
        imgResult = await createImage.mutateAsync(image)
      }

      onSubmit(imgResult)
    }
  }

  function getScaledCrop() {
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

    let result: Image
    if (defaultValues?.id) {
      result = await updateImage.mutateAsync({
        id: defaultValues.id,
        image: {
          assetId: assetUri,
          crop: getScaledCrop(),
          altText: "Uploaded image",
        },
      })
    } else {
      result = await createImage.mutateAsync({
        assetId: assetUri,
        crop: getScaledCrop(),
        altText: "Uploaded image",
      })
    }

    onSubmit(result)
  }

  async function changeImage() {
    setImgSrc("")
    setAssetId("")
  }

  async function onDownloadClick() {
    const blob = await getBlob()
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
    }
    blobUrlRef.current = URL.createObjectURL(blob)

    if (hiddenAnchorRef.current) {
      hiddenAnchorRef.current.href = blobUrlRef.current
      hiddenAnchorRef.current.click()
    }
  }

  async function getBlob() {
    const image = imgRef.current
    const previewCanvas = previewCanvasRef.current
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error("Crop canvas does not exist")
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    // const scaleX = image.naturalWidth / image.width
    // const scaleY = image.naturalHeight / image.height

    // const offscreen = new OffscreenCanvas(completedCrop.width * scaleX, completedCrop.height * scaleY)
    const offscreen = new OffscreenCanvas(completedCrop.width, completedCrop.height)
    const ctx = offscreen.getContext("2d")
    if (!ctx) {
      throw new Error("No 2d context")
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    )
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: "image/png",
    })

    return blob
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

  // if (!editOpen) {
  //   return (
  //     <button onClick={startEdit} type="button">
  //       Last opp bilde
  //     </button>
  //   )
  // }

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
          <div>
            <button type="button" onClick={onSetCrop}>
              Lagre
            </button>
            <button type="button" onClick={onDownloadClick}>
              Last ned
            </button>
            <div style={{ fontSize: 12, color: "#666" }}>
              If you get a security error when downloading try opening the Preview in a new tab (icon near top right).
            </div>
            <a
              href="#hidden"
              ref={hiddenAnchorRef}
              download
              style={{
                position: "absolute",
                top: "-200vh",
                visibility: "hidden",
              }}
            >
              Hidden download
            </a>
          </div>
        </div>
      )}
      {!cropOpen && imgSrc && (
        <div>
          <button onClick={toggleShowCrop} type="button">
            Endre crop
          </button>
          <button onClick={changeImage} type="button">
            Endre bilde
          </button>
        </div>
      )}
      {!!completedCrop && (
        <>
          <div>
            <img src={imgSrc} alt="Crop" style={{ display: "none" }} ref={imgRef} />
            <canvas
              ref={previewCanvasRef}
              style={{
                border: "1px solid black",
                objectFit: "contain",
                // width: completedCrop.width,
                width: 200,
                // height: completedCrop.height,
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
