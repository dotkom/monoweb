import { AspectRatio, Button, Collapse, Group, Loader, Skeleton, Stack, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { type FC, useState } from "react"
import { useZxing } from "react-zxing"
import { useUpdateEventAttendanceMutation } from "../mutations"

export const QrCodeScanner: FC = () => {
  const registerAttendance = useUpdateEventAttendanceMutation()
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
      const attendeeId = result.getText()
      registerAttendance.mutate({
        id: attendeeId,
        attended: true,
      })
    },
    paused: !scannerOpen,
  })

  return (
    <Stack gap="xs" align="flex-start">
      <Group>
        <Button onClick={handleToggle}>{scannerOpen ? "Lukk scanner" : "Åpne scanner"}</Button>
        {scannerOpen && (
          <Group gap="xs">
            {videoReady ? (
              <>
                <Loader type="dots" />
                <Text>Scanner etter QR-koder</Text>
              </>
            ) : (
              <>
                <Loader type="dots" color="gray" />
                <Text c="gray">Laster inn scanner...</Text>
              </>
            )}
          </Group>
        )}
      </Group>
      <Collapse in={scannerOpen}>
        {!videoReady && <Skeleton height={500} width={500} radius="sm" />}

        <AspectRatio w={500}>
          <video
            ref={ref}
            onCanPlay={() => setVideoReady(true)}
            muted
            playsInline
            style={{
              display: videoReady ? "block" : "none",
              transform: "scaleX(-1)",
              borderRadius: "4px",
            }}
          />
        </AspectRatio>
      </Collapse>
    </Stack>
  )
}
