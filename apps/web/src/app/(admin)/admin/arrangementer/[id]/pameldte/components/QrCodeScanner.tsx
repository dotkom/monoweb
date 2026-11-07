"use client"

import type { Attendance, AttendeeId } from "@dotkomonline/rpc/attendance"
import { Button, cn, Text } from "@dotkomonline/ui"
import { IconCameraRotate, IconQrcode, IconQrcodeOff, IconX } from "@tabler/icons-react"
import { type FC, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import z from "zod"
import { useUpdateEventAttendanceMutation } from "../../../mutations"
import { QrCodeCheckInFeedback } from "./QrCodeCheckInFeedback"
import { useQrCodeCamera } from "./use-qr-code-camera"
import { useQrCodeCheckIn } from "./use-qr-code-check-in"

interface QrCodeScannerProps {
  attendance: Attendance
  disabled?: boolean
}

type CameraFacingMode = "user" | "environment"

export const QrCodeScanner: FC<QrCodeScannerProps> = ({ attendance, disabled }) => {
  const attendanceMutation = useUpdateEventAttendanceMutation({ isNotificationEnabled: false })
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [selectedCameraFacingMode, setSelectedCameraFacingMode] = useState<CameraFacingMode | null>(null)
  const [actualCameraFacingMode, setActualCameraFacingMode] = useState<CameraFacingMode | null>(null)
  const [canSwitchCamera, setCanSwitchCamera] = useState(false)

  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  const requestedCameraFacingMode = selectedCameraFacingMode ?? "user"
  const activeCameraFacingMode = actualCameraFacingMode ?? requestedCameraFacingMode
  const isMirrored = activeCameraFacingMode === "user"
  const cameraSwitchLabel = activeCameraFacingMode === "user" ? "Bytt til bakkamera" : "Bytt til frontkamera"

  const cameraConstraints = useMemo<MediaStreamConstraints>(
    () => ({
      video: {
        facingMode: {
          ideal: requestedCameraFacingMode,
        },
      },
    }),
    [requestedCameraFacingMode]
  )

  const handleUpdateAttendance = async (attendeeId: AttendeeId, attendedAt: Date | null) => {
    const attendanceUpdate = { id: attendeeId, at: attendedAt }

    await attendanceMutation.mutateAsync(attendanceUpdate)
  }

  const { checkIn, scanAttendee, registerAttendance, undoAttendance, closeCheckIn } = useQrCodeCheckIn({
    attendance,
    onUpdateAttendance: handleUpdateAttendance,
  })

  const isCheckInModalOpen = checkIn !== null && !checkIn.isAutomaticCheckIn
  const isCameraEnabled = isScannerOpen && disabled !== true && !isCheckInModalOpen

  const handleToggle = () => {
    if (!isScannerOpen && selectedCameraFacingMode === null) {
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches
      const defaultCameraFacingMode = isTouchDevice ? "environment" : "user"

      setSelectedCameraFacingMode(defaultCameraFacingMode)
    }

    setActualCameraFacingMode(null)
    setIsScannerOpen((isOpen) => !isOpen)
  }

  const handleSwitchCamera = () => {
    const nextCameraFacingMode = activeCameraFacingMode === "user" ? "environment" : "user"

    setActualCameraFacingMode(null)
    setSelectedCameraFacingMode(nextCameraFacingMode)
  }

  const handleVideoReady = async (cameraStream: MediaStream) => {
    const videoTrack = cameraStream.getVideoTracks()[0]
    const cameraFacingMode = videoTrack?.getSettings().facingMode

    if (cameraFacingMode === "user" || cameraFacingMode === "environment") {
      setActualCameraFacingMode(cameraFacingMode)
    }

    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()
      const cameras = mediaDevices.filter((device) => device.kind === "videoinput")
      const hasRequestedCamera = cameraFacingMode === undefined || cameraFacingMode === requestedCameraFacingMode

      setCanSwitchCamera(cameras.length > 1 && hasRequestedCamera)
    } catch {
      setCanSwitchCamera(false)
    }
  }

  const {
    ref: cameraReference,
    isReady: isVideoReady,
    error: cameraError,
    retry: retryCamera,
  } = useQrCodeCamera({
    onDecodeResult: (scannedValue) => {
      if (!isCameraEnabled) {
        return
      }

      const parsedAttendeeId = z.guid().safeParse(scannedValue)

      if (!parsedAttendeeId.success) {
        return
      }

      scanAttendee(parsedAttendeeId.data)
    },
    isEnabled: isCameraEnabled,
    onReady: handleVideoReady,
    constraints: cameraConstraints,
  })

  const scannerPreview = (
    <div className="fixed right-4 top-[calc(4rem+env(safe-area-inset-top))] z-35 flex w-52 max-w-[calc(100%-2rem)] flex-col gap-1 rounded-xl border border-border bg-background p-2 shadow-xl md:right-10 md:top-24 md:w-72">
      <div className="flex items-center justify-between gap-2">
        <Text className="text-sm">Skann QR-koder</Text>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          className="shrink-0"
          aria-label="Lukk skanner"
          onClick={handleToggle}
        >
          <IconX className="size-4" />
        </Button>
      </div>

      <div className="relative w-full">
        {!isVideoReady && (
          <div
            className={cn(
              "flex h-[min(10rem,25dvh)] w-full flex-col items-center justify-center gap-2 rounded-sm bg-muted p-3 md:h-[min(14rem,30dvh)]",
              isCameraEnabled && cameraError === null && "animate-pulse"
            )}
          >
            {cameraError !== null && (
              <>
                <Text role="alert" className="text-center text-xs">
                  {cameraError}
                </Text>
                <Button type="button" variant="secondary" size="sm" onClick={retryCamera}>
                  Prøv igjen
                </Button>
              </>
            )}
          </div>
        )}
        <div className={isVideoReady ? "relative" : "relative h-0 w-0 overflow-hidden"}>
          <video
            ref={cameraReference}
            muted
            playsInline
            className="h-[min(10rem,25dvh)] w-full rounded-sm object-cover md:h-[min(14rem,30dvh)]"
            style={{
              transform: isMirrored ? "scaleX(-1)" : undefined,
            }}
          />

          {isVideoReady && canSwitchCamera && (
            <button
              type="button"
              className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded bg-black/25"
              aria-label={cameraSwitchLabel}
              title={cameraSwitchLabel}
              onClick={handleSwitchCamera}
            >
              <IconCameraRotate color="white" className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Button
        type="button"
        variant="default"
        className="w-fit min-h-12 md:min-h-0"
        aria-expanded={isScannerOpen}
        disabled={disabled}
        icon={isScannerOpen ? <IconQrcodeOff className="size-5" /> : <IconQrcode className="size-5" />}
        onClick={handleToggle}
      >
        {isScannerOpen ? "Lukk skanner" : "Skann QR-koder"}
      </Button>

      {isScannerOpen && portalContainer !== null && createPortal(scannerPreview, portalContainer)}

      {checkIn !== null && (
        <QrCodeCheckInFeedback
          attendance={attendance}
          checkIn={checkIn}
          onRegisterAttendance={registerAttendance}
          onUndoAttendance={undoAttendance}
          onClose={closeCheckIn}
        />
      )}
    </>
  )
}
