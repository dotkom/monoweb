import type { Attendance } from "@dotkomonline/types"
import { ActionIcon, AspectRatio, Button, Group, Loader, Skeleton, Stack, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconFlipVertical, IconQrcode, IconQrcodeOff } from "@tabler/icons-react"
import { type FC, useEffect, useRef, useState } from "react"
import { useZxing } from "react-zxing"
import z from "zod"
import { openQRCodeScannedModal } from "./qr-code-scanned-modal"

interface QrCodeScannerProps {
  attendance: Attendance
}

export const QrCodeScanner: FC<QrCodeScannerProps> = ({ attendance }) => {
  const [shouldMirror, { open: setMirrorTrue, toggle: toggleMirror }] = useDisclosure(false)
  const [scannerOpen, { toggle: toggleScanner }] = useDisclosure(false)
  const [videoReady, setVideoReady] = useState(false)
  const paused = useRef(false)

  const handleToggle = () => {
    toggleScanner()

    if (!scannerOpen) {
      setVideoReady(false)
    }
  }

  const { ref } = useZxing({
    onDecodeResult: (result) => {
      if (paused.current) {
        return
      }

      const id = z.string().uuid().safeParse(result.getText())

      if (id.success) {
        paused.current = true

        openQRCodeScannedModal({
          attendance,
          attendeeId: id.data,
          onClose: () => {
            paused.current = false
          },
        })
      }
    },
    paused: !scannerOpen || paused.current,
    timeBetweenDecodingAttempts: 150,
    constraints: {
      video: {
        facingMode: {
          // Makes it try rear-facing camera first
          ideal: "environment",
        },
      },
    },
  })

  useEffect(() => {
    const videoElement = ref.current
    const track = videoElement?.srcObject instanceof MediaStream ? videoElement.srcObject.getVideoTracks()[0] : null
    const settings = track?.getSettings()
    if (settings?.facingMode === "user") {
      setMirrorTrue()
    }
  }, [ref, setMirrorTrue])

  return (
    <Stack gap="xs">
      <Group>
        <Button
          onClick={handleToggle}
          leftSection={scannerOpen ? <IconQrcodeOff size={20} /> : <IconQrcode size={20} />}
        >
          {scannerOpen ? "Lukk scanner" : "Scan QR-koder"}
        </Button>
        {scannerOpen && (
          <Group gap="xs">
            {videoReady ? (
              <>
                <Loader size="sm" type="dots" />
                <Text size="sm">Scanner...</Text>
              </>
            ) : (
              <>
                <Loader size="sm" type="dots" color="gray" />
                <Text size="sm" c="gray">
                  Laster inn...
                </Text>
              </>
            )}
          </Group>
        )}
      </Group>

      {scannerOpen && !videoReady && <Skeleton height={450} width={450} radius="sm" />}
      <AspectRatio w={scannerOpen && videoReady ? 450 : 0} style={{ position: "relative" }}>
        <video
          ref={ref}
          muted
          onCanPlay={() => setVideoReady(true)}
          playsInline
          autoPlay
          style={{
            display: videoReady ? "block" : "none",
            transform: shouldMirror ? "scaleX(-1)" : undefined,
            borderRadius: "4px",
          }}
        />

        <ActionIcon
          size="input-xs"
          bg="rgba(0,0,0,0.25)"
          variant="transparent"
          w="fit-content"
          onClick={toggleMirror}
          style={{
            display: videoReady ? "block" : "none",
            position: "absolute",
            top: 12,
            right: 12,
          }}
        >
          <IconFlipVertical color="white" size={48} />
        </ActionIcon>
      </AspectRatio>
    </Stack>
  )
}
