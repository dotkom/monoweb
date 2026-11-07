"use client"

import type { Attendance, AttendeeId } from "@dotkomonline/rpc/attendance"
import { Button, Text } from "@dotkomonline/ui"
import { IconFlipVertical, IconQrcode, IconQrcodeOff } from "@tabler/icons-react"
import { type FC, useState } from "react"
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

  const handleUpdateAttendance = async (attendeeId: AttendeeId, attendedAt: Date | null) => {
    const attendanceUpdate = { id: attendeeId, at: attendedAt }

    await attendanceMutation.mutateAsync(attendanceUpdate)
  }

  const { checkIn, scanAttendee, registerAttendance, undoAttendance, closeCheckIn } = useQrCodeCheckIn({
    attendance,
    onUpdateAttendance: handleUpdateAttendance,
  })

  const isScanningPaused = !isScannerOpen || disabled === true || checkIn !== null

  const handleToggle = () => {
    setIsVideoReady(false)
    setIsScannerOpen((isOpen) => !isOpen)
  }

  const { ref: cameraReference } = useZxing({
    onDecodeResult: (result) => {
      if (isScanningPaused) {
        return
      }

      const scannedValue = result.getText()
      const parsedAttendeeId = z.guid().safeParse(scannedValue)

      if (!parsedAttendeeId.success) {
        return
      }

      scanAttendee(parsedAttendeeId.data)
    },
    paused: isScanningPaused,
    timeBetweenDecodingAttempts: 150,
    constraints: {
      video: {
        facingMode: {
          ideal: "environment",
        },
      },
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="default"
          disabled={disabled}
          icon={isScannerOpen ? <IconQrcodeOff size={20} /> : <IconQrcode size={20} />}
          onClick={handleToggle}
        >
          {isScannerOpen ? "Lukk scanner" : "Scan QR-koder"}
        </Button>
        {isScannerOpen && (
          <div className="flex items-center gap-2">
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <Text className="text-sm">{isVideoReady ? "Scanner..." : "Laster inn..."}</Text>
          </div>
        )}
      </div>

      <div className="relative w-fit">
        {isScannerOpen && !isVideoReady && <div className="h-[450px] w-[450px] animate-pulse rounded-sm bg-muted" />}
        <div className={isScannerOpen && isVideoReady ? "relative" : "relative h-0 w-0 overflow-hidden"}>
          <video
            ref={cameraReference}
            muted
            onCanPlay={() => {
              setIsVideoReady(true)
            }}
            playsInline
            autoPlay
            className="rounded-sm"
            style={{
              width: 450,
              height: 450,
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
              <IconFlipVertical color="white" size={48} />
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
