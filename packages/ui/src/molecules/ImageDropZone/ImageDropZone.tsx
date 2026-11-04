"use client"

import type { ReactNode } from "react"
import { useDropzone, type FileError, type FileRejection } from "react-dropzone"
import { cn } from "../../utils"

export const IMAGE_PICK_MAX_SIZE_KIB = 30 * 1024

export type ImageDropZoneState = {
  isDragActive: boolean
  isDragAccept: boolean
  isDragReject: boolean
  isDisabled: boolean
}

export type ImageDropZoneProps = {
  onFile: (file: File) => void
  onReject?: (error: FileError) => void
  children: ReactNode | ((state: ImageDropZoneState) => ReactNode)
  disabled?: boolean
  accept?: Record<string, string[]>
  maxSizeKiB?: number
  className?: string
}

export function ImageDropZone({
  onFile,
  onReject,
  children,
  disabled = false,
  accept,
  maxSizeKiB,
  className,
}: ImageDropZoneProps) {
  const maxSizeBytes = maxSizeKiB !== undefined ? maxSizeKiB * 1024 : undefined

  const handleDrop = (files: File[]) => {
    const file = files[0]
    if (file === undefined) {
      return
    }

    onFile(file)
  }

  const handleDropRejected = (rejections: FileRejection[]) => {
    const firstError = rejections[0]?.errors[0]
    if (firstError === undefined) {
      return
    }

    onReject?.(firstError)
  }

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop: handleDrop,
    onDropRejected: handleDropRejected,
    accept,
    maxSize: maxSizeBytes,
    maxFiles: 1,
    multiple: false,
    disabled,
  })

  const state: ImageDropZoneState = {
    isDragActive,
    isDragAccept,
    isDragReject,
    isDisabled: disabled,
  }

  return (
    <div {...getRootProps()} className={cn("relative", disabled && "pointer-events-none opacity-60", className)}>
      <input {...getInputProps()} />
      {typeof children === "function" ? children(state) : children}
    </div>
  )
}
