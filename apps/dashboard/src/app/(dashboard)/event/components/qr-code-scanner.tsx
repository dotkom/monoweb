import { Button } from "@mantine/core"
import { type FC, useState } from "react"
import { useZxing } from "react-zxing"
import { useUpdateEventAttendanceMutation } from "../mutations"

export const QrCodeScanner: FC = () => {
  const registerAttendance = useUpdateEventAttendanceMutation()
  const [scannerOpen, setScannerOpen] = useState(false)

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

  if (!scannerOpen) {
    return <Button onClick={() => setScannerOpen(true)}>Åpne scanner</Button>
  }

  return (
    <div>
      <Button onClick={() => setScannerOpen(false)}>Lukk scanner</Button>
      {/* biome-ignore lint/a11y/useMediaCaption: caption what */}
      <video ref={ref} style={{ transform: "scaleX(-1)" }} />
    </div>
  )
}
