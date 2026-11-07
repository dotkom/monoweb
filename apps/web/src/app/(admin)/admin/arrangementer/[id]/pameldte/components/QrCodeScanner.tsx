"use client"

import type { Attendance, AttendeeId } from "@dotkomonline/rpc/attendance"
import { Button, cn, Text } from "@dotkomonline/ui"
import { IconCameraRotate, IconQrcode, IconQrcodeOff } from "@tabler/icons-react"
import { type FC, useMemo, useState } from "react"
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
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [selectedCameraFacingMode, setSelectedCameraFacingMode] = useState<CameraFacingMode | null>(null)
  const [actualCameraFacingMode, setActualCameraFacingMode] = useState<CameraFacingMode | null>(null)
  const [canSwitchCamera, setCanSwitchCamera] = useState(false)

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

  const scanner = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="default"
          disabled={disabled}
          icon={isScannerOpen ? <IconQrcodeOff className="size-5" /> : <IconQrcode className="size-5" />}
          onClick={handleToggle}
        >
          {isScannerOpen ? "Lukk skanner" : "Skann QR-koder"}
        </Button>
        {isScannerOpen && <Text className="text-sm">Skann QR-koder</Text>}
      </div>

      <div className="relative w-fit">
        {isScannerOpen && !isVideoReady && (
          <div
            className={cn(
              "flex size-[450px] flex-col items-center justify-center gap-2 rounded-sm bg-muted p-3",
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
            className="size-[450px] rounded-sm object-contain"
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
      {scanner}

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
