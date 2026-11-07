"use client"

import type { Attendance, AttendeeId } from "@dotkomonline/rpc/attendance"
import { Button, Text } from "@dotkomonline/ui"
import { IconFlipVertical, IconQrcode, IconQrcodeOff } from "@tabler/icons-react"
import { type FC, useMemo, useState } from "react"
import { useZxing } from "react-zxing"
import z from "zod"
import { useUpdateEventAttendanceMutation } from "../../../mutations"
import { QrCodeCheckInFeedback } from "./QrCodeCheckInFeedback"
import { useQrCodeCheckIn } from "./use-qr-code-check-in"

interface QrCodeScannerProps {
  attendance: Attendance
  disabled?: boolean
}

export const QrCodeScanner: FC<QrCodeScannerProps> = ({ attendance, disabled }) => {
  const attendanceMutation = useUpdateEventAttendanceMutation({ isNotificationEnabled: false })
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isMirrored, setIsMirrored] = useState(false)

  const cameraConstraints = useMemo<MediaStreamConstraints>(
    () => ({
      video: {
        facingMode: {
          ideal: "environment",
        },
      },
    }),
    []
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
    setIsVideoReady(false)
    setIsScannerOpen((isOpen) => !isOpen)
  }

  const { ref: cameraReference } = useZxing({
    onDecodeResult: (result) => {
      if (!isCameraEnabled) {
        return
      }

      const scannedValue = result.getText()
      const parsedAttendeeId = z.guid().safeParse(scannedValue)

      if (!parsedAttendeeId.success) {
        return
      }

      scanAttendee(parsedAttendeeId.data)
    },
    paused: !isCameraEnabled,
    timeBetweenDecodingAttempts: 150,
    constraints: cameraConstraints,
  })

  return (
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
        {isScannerOpen && (
          <div className="flex items-center gap-2">
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <Text className="text-sm">{isVideoReady ? "Skanner..." : "Laster inn..."}</Text>
          </div>
        )}
      </div>

      <div className="relative w-fit">
        {isScannerOpen && !isVideoReady && <div className="size-[450px] animate-pulse rounded-sm bg-muted" />}
        <div className={isVideoReady ? "relative" : "relative h-0 w-0 overflow-hidden"}>
          <video
            ref={cameraReference}
            muted
            onCanPlay={() => {
              setIsVideoReady(true)
            }}
            playsInline
            autoPlay
            className="size-[450px] rounded-sm object-contain"
            style={{
              transform: isMirrored ? "scaleX(-1)" : undefined,
            }}
          />

          {isScannerOpen && isVideoReady && (
            <button
              type="button"
              className="absolute right-3 top-3 rounded bg-black/25 p-1"
              aria-label="Speil kamera"
              aria-pressed={isMirrored}
              onClick={() => {
                setIsMirrored((isCurrentlyMirrored) => !isCurrentlyMirrored)
              }}
            >
              <IconFlipVertical color="white" className="size-12" />
            </button>
          )}
        </div>
      </div>

      {checkIn !== null && (
        <QrCodeCheckInFeedback
          attendance={attendance}
          checkIn={checkIn}
          onRegisterAttendance={registerAttendance}
          onUndoAttendance={undoAttendance}
          onClose={closeCheckIn}
        />
      )}
    </div>
  )
}
