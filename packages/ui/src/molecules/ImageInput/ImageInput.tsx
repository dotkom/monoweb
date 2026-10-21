"use client"

import { Input } from "#components/input"
import { compressImage } from "@dotkomonline/utils/compress-image"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from "react"
import { z } from "zod"
import { Button } from "../../atoms/Button/Button"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"
import { Alert } from "../Alert/Alert"
import { ImageAspectGuideOverlay } from "../ImageCropper/ImageAspectGuideOverlay"
import { ImageCropper, type ImageCropperArea } from "../ImageCropper/ImageCropper"
import { useCropImage, type CropImageError } from "../ImageCropper/use-crop-image"
import { IMAGE_PICK_MAX_SIZE_KIB, ImageDropZone } from "../ImageDropZone/ImageDropZone"
import { getAspectRatioWarning, type AspectRatio } from "./image-aspect"

export type { AspectRatio } from "./image-aspect"

export type ImageInputHandle = {
  commit: () => Promise<string | null>
}

// The max height or width of the image after compression
const OUTPUT_MAX_WIDTH_OR_HEIGHT = 2048

export type ImageInputProps = {
  value: string | null | undefined
  onChange: (imageUrl: string) => void
  onFileUpload: (file: File) => Promise<string>
  label?: ReactNode
  description?: ReactNode
  error?: string
  disabled?: boolean
  acceptGif?: boolean
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
  overlayAspectRatio?: AspectRatio
  cropLegend?: ReactNode
  className?: string
  /** When true, cropping is confirmed via {@link ImageInputHandle.commit} instead of an inline button. */
  hideSubmitButton?: boolean
  onCanCommitChange?: (canCommit: boolean) => void
}

const STAGE = {
  EMPTY: "empty",
  CROPPING: "cropping",
  LOCAL_DRAFT: "local-draft",
  REMOTE_IMAGE: "remote-image",
} as const

type Stage =
  | { status: typeof STAGE.EMPTY }
  | { status: typeof STAGE.CROPPING; file: File; aspectRatio: AspectRatio }
  | { status: typeof STAGE.LOCAL_DRAFT; file: File; previewUrl: string }
  | { status: typeof STAGE.REMOTE_IMAGE; url: string }

function getAccept(acceptGif: boolean | undefined) {
  const accept: Record<string, string[]> = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
  }

  if (acceptGif) {
    accept["image/gif"] = [".gif"]
  }

  return accept
}

const HttpOrHttpsUrlSchema = z.url({ protocol: /^https?$/ })

function isHttpUrl(value: string): boolean {
  return HttpOrHttpsUrlSchema.safeParse(value).success
}

function formatMaxSize(maxSizeKiB: number): string {
  if (maxSizeKiB % 1024 === 0) {
    return `${maxSizeKiB / 1024} MiB`
  }

  return `${maxSizeKiB} KiB`
}

function fileTooLargeMessage(maxSizeKiB: number): string {
  return `Filen er for stor. Maks filstørrelse er ${formatMaxSize(maxSizeKiB)}.`
}

function getErrorMessageFromCropError(error: CropImageError, maxSizeKiB: number): string {
  if (error === "FILE_TOO_LARGE") {
    return fileTooLargeMessage(maxSizeKiB)
  }
  if (error === "NOT_READY") {
    return "Bildet er ikke klart ennå."
  }
  return "Kunne ikke behandle bildet. Prøv et annet bildeformat."
}

export const ImageInput = forwardRef<ImageInputHandle, ImageInputProps>(function ImageInput(
  {
    value,
    onChange,
    onFileUpload,
    label,
    description,
    error: errorFromParent,
    disabled,
    acceptGif,
    maxSizeKiB = 1024,
    aspectRatio,
    overlayAspectRatio,
    cropLegend,
    className,
    hideSubmitButton = false,
    onCanCommitChange,
  },
  ref
) {
  const [stage, setStage] = useState<Stage>(() =>
    value != null && value !== "" ? { status: STAGE.REMOTE_IMAGE, url: value } : { status: STAGE.EMPTY }
  )

  const [urlDraft, setUrlDraft] = useState(value ?? "")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [aspectRatioWarning, setAspectRatioWarning] = useState<string | null>(null)

  const cropImage = useCropImage({
    outputSize: { maxWidth: OUTPUT_MAX_WIDTH_OR_HEIGHT, maxHeight: OUTPUT_MAX_WIDTH_OR_HEIGHT },
    maxExportKiB: maxSizeKiB,
  })

  const accept = useMemo(() => getAccept(acceptGif), [acceptGif])
  const displayError = errorFromParent !== undefined ? errorFromParent : uploadError !== null ? uploadError : undefined
  // If an aspect ratio is not provided, we use 16:9 to show the image preview
  const panelAspect = aspectRatio ?? { width: 16, height: 9 }

  useEffect(() => {
    return () => {
      if (stage.status === STAGE.LOCAL_DRAFT) {
        URL.revokeObjectURL(stage.previewUrl)
      }
    }
  }, [stage])

  let canCommit = stage.status !== "empty" || isHttpUrl(urlDraft)
  if (stage.status === "cropping") {
    canCommit = cropImage.isCropReady && !cropImage.isPreparing
  }

  useEffect(() => {
    onCanCommitChange?.(canCommit)
  }, [canCommit, onCanCommitChange])

  const uploadAndSetFile = async (file: File): Promise<string | null> => {
    setUploadError(null)
    setIsUploading(true)

    try {
      const result = await onFileUpload(file)

      onChange(result)
      setUrlDraft(result)
      setStage({ status: STAGE.REMOTE_IMAGE, url: result })
      cropImage.reset()

      return result
    } catch {
      setUploadError("Kunne ikke laste opp filen.")

      return null
    } finally {
      setIsUploading(false)
    }
  }

  const cropAndUpload = async (): Promise<string | null> => {
    const cropped = await cropImage.exportCrop()
    if (!cropped.success) {
      setUploadError(getErrorMessageFromCropError(cropped.error, maxSizeKiB))

      return null
    }

    return uploadAndSetFile(cropped.file)
  }

  const compressAndUpload = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file, {
      maxSizeKiB,
      maxWidthOrHeight: OUTPUT_MAX_WIDTH_OR_HEIGHT,
    })
    if (!compressed.success) {
      setUploadError(getErrorMessageFromCropError(compressed.error, maxSizeKiB))

      return null
    }

    return uploadAndSetFile(compressed.file)
  }

  const handleFile = async (file: File) => {
    setUploadError(null)

    // If an aspect ratio is not provided, we compress the image
    if (aspectRatio === undefined) {
      const previewUrl = URL.createObjectURL(file)
      setStage({ status: STAGE.LOCAL_DRAFT, file, previewUrl })
      setUrlDraft("")

      const aspectRatioWarning = await getAspectRatioWarning(previewUrl, aspectRatio)
      setAspectRatioWarning(aspectRatioWarning)

      return
    }

    setStage({ status: "cropping", file, aspectRatio })
    const prepared = await cropImage.prepare(file)

    if (!prepared.success) {
      setStage({ status: STAGE.EMPTY })
      setUploadError(getErrorMessageFromCropError(prepared.error, maxSizeKiB))

      return
    }

    if (!prepared.needsCrop) {
      const previewUrl = URL.createObjectURL(prepared.file)
      setStage({ status: STAGE.LOCAL_DRAFT, file: prepared.file, previewUrl })
    }
  }

  const applyUrl = async (draft: string): Promise<string | null> => {
    const trimmed = draft.trim()
    setUploadError(null)
    setUrlDraft(trimmed)

    if (trimmed === "") {
      handleChangeImage()

      return null
    }

    if (!isHttpUrl(trimmed)) {
      setUploadError("URL må starte med http eller https.")

      return null
    }

    setStage({ status: STAGE.REMOTE_IMAGE, url: trimmed })
    setAspectRatioWarning(await getAspectRatioWarning(trimmed, aspectRatio))

    if (!hideSubmitButton) {
      onChange(trimmed)
    }

    return trimmed
  }

  const handleChangeImage = () => {
    cropImage.reset()
    setStage({ status: STAGE.EMPTY })
    setUrlDraft("")
    setUploadError(null)
    setAspectRatioWarning(null)
    onChange("")
  }

  const commit = async (): Promise<string | null> => {
    switch (stage.status) {
      case STAGE.CROPPING:
        return cropAndUpload()
      case STAGE.LOCAL_DRAFT:
        return compressAndUpload(stage.file)
      case STAGE.REMOTE_IMAGE:
        onChange(stage.url)

        return stage.url
      case STAGE.EMPTY:
        if (isHttpUrl(urlDraft)) {
          return applyUrl(urlDraft)
        }

        return null
    }
  }

  const commitRef = useRef(commit)
  commitRef.current = commit

  useImperativeHandle(
    ref,
    () => ({
      commit: () => commitRef.current(),
    }),
    []
  )

  let body: ReactNode
  switch (stage.status) {
    case STAGE.CROPPING:
      body = (
        <CroppingView
          previewUrl={cropImage.previewUrl}
          aspectRatio={stage.aspectRatio}
          overlayAspectRatio={overlayAspectRatio}
          cropLegend={cropLegend}
          disabled={disabled}
          isUploading={isUploading}
          isPreparing={cropImage.isPreparing}
          isCropReady={cropImage.isCropReady}
          hideSubmitButton={hideSubmitButton}
          onCropChange={cropImage.onCropChange}
          onChangeImage={handleChangeImage}
          onUseImage={() => {
            void cropAndUpload()
          }}
        />
      )
      break

    case STAGE.LOCAL_DRAFT:
    case STAGE.REMOTE_IMAGE:
      body = (
        <PreviewView
          previewSrc={stage.status === STAGE.LOCAL_DRAFT ? stage.previewUrl : stage.url}
          panelAspect={panelAspect}
          overlayAspectRatio={overlayAspectRatio}
          pendingFile={stage.status === STAGE.LOCAL_DRAFT ? stage.file : null}
          disabled={disabled}
          isUploading={isUploading}
          hideSubmitButton={hideSubmitButton}
          onChangeImage={handleChangeImage}
          onUseImage={() => {
            if (stage.status === STAGE.LOCAL_DRAFT) {
              void compressAndUpload(stage.file)
            }
          }}
        />
      )
      break

    case STAGE.EMPTY:
      body = (
        <PickerView
          aspectRatio={panelAspect}
          accept={accept}
          acceptGif={acceptGif}
          disabled={disabled}
          isUploading={isUploading}
          urlDraft={urlDraft}
          onFile={(file) => {
            void handleFile(file)
          }}
          onReject={(message) => {
            setUploadError(message)
          }}
          onUrlDraftChange={(nextDraft) => {
            setUrlDraft(nextDraft)
            setUploadError(null)

            if (nextDraft.trim() === "") {
              setAspectRatioWarning(null)
              if (!hideSubmitButton) {
                onChange("")
              }
            }
          }}
          onApplyUrl={(draft) => {
            void applyUrl(draft)
          }}
        />
      )
      break
  }

  return (
    <ImageInputLayout
      className={className}
      label={label}
      description={description}
      error={displayError}
      warning={aspectRatioWarning}
    >
      {body}
    </ImageInputLayout>
  )
})

interface ImageInputLayoutProps {
  className?: string
  label?: ReactNode
  description?: ReactNode
  error?: string
  warning: string | null
  children: ReactNode
}

function ImageInputLayout({ className, label, description, error, warning, children }: ImageInputLayoutProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        {label != null && label !== "" && (
          <Text element="label" className="text-sm font-medium text-foreground">
            {label}
          </Text>
        )}
        {description != null && description !== "" && (
          <Text className="text-xs text-muted-foreground">{description}</Text>
        )}
        {error != null && error !== "" && <Text className="text-xs text-destructive">{error}</Text>}
        {children}
      </div>

      {warning !== null && (
        <Alert status="warning" title="Advarsel" showIcon>
          {warning}
        </Alert>
      )}
    </div>
  )
}

function ChangeImageButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="w-fit" disabled={disabled} onClick={onClick}>
      Bytt bilde
    </Button>
  )
}

interface CroppingViewProps {
  previewUrl: string | null
  aspectRatio: AspectRatio
  overlayAspectRatio?: AspectRatio
  cropLegend?: ReactNode
  disabled?: boolean
  isUploading: boolean
  isPreparing: boolean
  isCropReady: boolean
  hideSubmitButton: boolean
  onCropChange: (croppedArea: ImageCropperArea, croppedAreaPixels: ImageCropperArea) => void
  onChangeImage: () => void
  onUseImage: () => void
}

function CroppingView({
  previewUrl,
  aspectRatio,
  overlayAspectRatio,
  cropLegend,
  disabled,
  isUploading,
  isPreparing,
  isCropReady,
  hideSubmitButton,
  onCropChange,
  onChangeImage,
  onUseImage,
}: CroppingViewProps) {
  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-md"
        style={{ aspectRatio: `${aspectRatio.width} / ${aspectRatio.height}` }}
      >
        <ImageCropper
          objectUrl={previewUrl}
          onChange={onCropChange}
          aspectRatio={aspectRatio}
          shape="rect"
          showGrid={false}
          overlayAspectRatio={overlayAspectRatio}
        />
      </div>

      <div className="mt-2.5 flex min-h-8 items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {cropLegend != null && <Text className="text-muted-foreground text-xs leading-snug">{cropLegend}</Text>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ChangeImageButton disabled={disabled} onClick={onChangeImage} />
          {!hideSubmitButton && (
            <Button
              size="sm"
              variant="default"
              className="w-fit"
              disabled={isPreparing || !isCropReady || isUploading}
              onClick={onUseImage}
            >
              Bruk bilde
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

interface PreviewViewProps {
  previewSrc: string
  panelAspect: AspectRatio
  overlayAspectRatio?: AspectRatio
  pendingFile: File | null
  disabled?: boolean
  isUploading: boolean
  hideSubmitButton: boolean
  onChangeImage: () => void
  onUseImage: () => void
}

function PreviewView({
  previewSrc,
  panelAspect,
  overlayAspectRatio,
  pendingFile,
  disabled,
  isUploading,
  hideSubmitButton,
  onChangeImage,
  onUseImage,
}: PreviewViewProps) {
  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-md bg-muted"
        style={{ aspectRatio: `${panelAspect.width} / ${panelAspect.height}` }}
      >
        {/* biome-ignore lint/performance/noImgElement: preview */}
        <img src={previewSrc} alt="Forhåndsvisning av bilde" className="absolute inset-0 size-full object-contain" />
        {overlayAspectRatio !== undefined && (
          <ImageAspectGuideOverlay outerAspectRatio={panelAspect} innerAspectRatio={overlayAspectRatio} />
        )}
      </div>
      <div className="mt-2.5 flex min-h-8 items-center justify-end gap-2">
        <ChangeImageButton disabled={disabled} onClick={onChangeImage} />
        {!hideSubmitButton && pendingFile !== null && (
          <Button size="sm" variant="default" className="w-fit" disabled={isUploading} onClick={onUseImage}>
            Bruk bilde
          </Button>
        )}
      </div>
    </>
  )
}

interface PickerViewProps {
  aspectRatio: AspectRatio
  accept: Record<string, string[]>
  acceptGif?: boolean
  disabled?: boolean
  isUploading: boolean
  urlDraft: string
  onFile: (file: File) => void
  onReject: (message: string) => void
  onUrlDraftChange: (draft: string) => void
  onApplyUrl: (draft: string) => void
}

function PickerView({
  aspectRatio,
  accept,
  acceptGif,
  disabled,
  isUploading,
  urlDraft,
  onFile,
  onReject,
  onUrlDraftChange,
  onApplyUrl,
}: PickerViewProps) {
  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-md"
        style={{ aspectRatio: `${aspectRatio.width} / ${aspectRatio.height}` }}
      >
        <ImageDropZone
          accept={accept}
          maxSizeKiB={IMAGE_PICK_MAX_SIZE_KIB}
          disabled={disabled === true || isUploading}
          onFile={onFile}
          onReject={(fileError) => {
            if (fileError.code === "file-too-large") {
              onReject(fileTooLargeMessage(IMAGE_PICK_MAX_SIZE_KIB))
              return
            }

            onReject(fileError.message ?? "Kunne ikke laste opp filen.")
          }}
          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-md border border-border bg-muted/40 p-3"
        >
          {({ isDragAccept, isDragReject }) => (
            <div className="pointer-events-none flex flex-wrap items-center justify-center gap-4">
              {isDragAccept ? (
                <IconUpload size={40} className="text-primary" stroke={1.75} />
              ) : isDragReject ? (
                <IconX size={40} className="text-destructive" stroke={1.75} />
              ) : (
                <IconPhoto size={40} className="text-muted-foreground" stroke={1.75} />
              )}
              <div className="text-center sm:text-left">
                <Text className="text-sm">
                  {isUploading ? "Laster opp…" : "Dra bildet hit, eller klikk for å velge fil"}
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG{acceptGif === true ? ", WEBP eller GIF" : " eller WEBP"}
                </Text>
              </div>
            </div>
          )}
        </ImageDropZone>
      </div>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">eller lim inn en URL</span>
        </div>
      </div>

      <div className="relative">
        <Input
          type="url"
          placeholder="https://..."
          aria-label="Bilde-URL"
          disabled={disabled}
          value={urlDraft}
          className="pr-20"
          onChange={(event) => {
            onUrlDraftChange(event.target.value)
          }}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData("text")

            if (pasted.trim() === "") {
              return
            }

            event.preventDefault()
            onApplyUrl(pasted)
          }}
          onBlur={() => {
            if (urlDraft.trim() === "") {
              return
            }

            onApplyUrl(urlDraft)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              onApplyUrl(urlDraft)
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 px-2.5 font-semibold text-xs"
          disabled={disabled === true || urlDraft.trim() === ""}
          onClick={() => {
            onApplyUrl(urlDraft)
          }}
        >
          Hent
        </Button>
      </div>
    </>
  )
}
