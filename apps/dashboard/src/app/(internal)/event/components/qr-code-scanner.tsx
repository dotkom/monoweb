import { AspectRatio, Button, Group, Loader, Skeleton, Stack, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconQrcode, IconQrcodeOff } from "@tabler/icons-react"
import { type FC, useState } from "react"
import { useZxing } from "react-zxing"
import z from "zod"
import { useUpdateEventAttendanceMutation } from "../mutations"
import { openQRCodeScannedModal } from "./qr-code-scanned-modal"
import { useAttendanceGetByAttendeeIdQuery } from "../queries"

export const QrCodeScanner: FC = () => {
  const [scannerOpen, { toggle: toggleScanner }] = useDisclosure(false)
  const [videoReady, setVideoReady] = useState(false)

  const handleToggle = () => {
    toggleScanner()

    if (!scannerOpen) {
      setVideoReady(false)
    }
  }

  const { ref } = useZxing({
    onDecodeResult: (result) => {
      const id = z.string().uuid().safeParse(result.getText())

      if (!id.success) {
        return
      }

      const { data: attendance, isLoading } = useAttendanceGetByAttendeeIdQuery(id.data)

      openQRCodeScannedModal({ attendance, isLoading, attendeeId: id.data })
    },
    paused: !scannerOpen,
    constraints: {
      video: {
        facingMode: {
          // Makes it try rear-facing camera first
          ideal: "environment",
        },
      },
    },
  })

  const videoElement = ref.current
  const track = videoElement?.srcObject instanceof MediaStream ? videoElement.srcObject.getVideoTracks()[0] : null
  const settings = track?.getSettings()
  const isCameraMirrored = settings?.facingMode === "user"

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

      {scannerOpen && !videoReady && <Skeleton height={300} width={300} radius="sm" />}
      <AspectRatio w={scannerOpen && videoReady ? 300 : 0}>
        <video
          ref={ref}
          muted
          onCanPlay={() => setVideoReady(true)}
          playsInline
          style={{
            display: videoReady ? "block" : "none",
            transform: isCameraMirrored ? "scaleX(-1)" : undefined,
            borderRadius: "4px",
          }}
        />
      </AspectRatio>
    </Stack>
  )
}
