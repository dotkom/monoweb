"use client"

import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { AttendeeId } from "@dotkomonline/rpc/attendance"
import { Button, Text } from "@dotkomonline/ui"
import { IconFlipVertical, IconQrcode, IconQrcodeOff } from "@tabler/icons-react"
import { type FC, useRef, useState } from "react"
import { useZxing } from "react-zxing"
import z from "zod"
import { QRCodeScannedModal } from "./QrCodeScannedModal"

interface QrCodeScannerProps {
  attendance: Attendance
  disabled?: boolean
}

export const QrCodeScanner: FC<QrCodeScannerProps> = ({ attendance, disabled }) => {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [mirror, setMirror] = useState(false)
  const [scannedAttendeeId, setScannedAttendeeId] = useState<AttendeeId | null>(null)
  const paused = useRef(false)

  const handleToggle = () => {
    setScannerOpen((open) => {
      if (open) {
        setVideoReady(false)
      }
      return !open
    })
  }

  const { ref } = useZxing({
    onDecodeResult: (result) => {
      if (paused.current) {
        return
      }

      const id = z.guid().safeParse(result.getText())

      if (id.success) {
        paused.current = true
        setScannedAttendeeId(id.data)
      }
    },
    paused: !scannerOpen || paused.current,
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
          icon={scannerOpen ? <IconQrcodeOff size={20} /> : <IconQrcode size={20} />}
          onClick={handleToggle}
        >
          {scannerOpen ? "Lukk scanner" : "Scan QR-koder"}
        </Button>
        {scannerOpen && (
          <div className="flex items-center gap-2">
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <Text className="text-sm">{videoReady ? "Scanner..." : "Laster inn..."}</Text>
          </div>
        )}
      </div>

      <div className="relative w-fit">
        {scannerOpen && !videoReady && <div className="h-[450px] w-[450px] animate-pulse rounded-sm bg-muted" />}
        <div className={scannerOpen && videoReady ? "relative" : "relative h-0 w-0 overflow-hidden"}>
          <video
            ref={ref}
            muted
            onCanPlay={() => setVideoReady(true)}
            playsInline
            autoPlay
            className="rounded-sm"
            style={{
              width: 450,
              height: 450,
              transform: mirror ? "scaleX(-1)" : undefined,
            }}
          />

          {scannerOpen && videoReady && (
            <button
              type="button"
              className="absolute right-3 top-3 rounded bg-black/25 p-1"
              onClick={() => setMirror((value) => !value)}
            >
              <IconFlipVertical color="white" size={48} />
            </button>
          )}
        </div>
      </div>

      {scannedAttendeeId && (
        <QRCodeScannedModal
          open={Boolean(scannedAttendeeId)}
          onOpenChange={(open) => {
            if (!open) {
              setScannedAttendeeId(null)
            }
          }}
          attendance={attendance}
          attendeeId={scannedAttendeeId}
          onClose={() => {
            paused.current = false
          }}
        />
      )}
    </div>
  )
}
