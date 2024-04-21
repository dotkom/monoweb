import type { AttendanceId } from "@dotkomonline/types"
import { Button } from "@mantine/core"
import { type FC, useState } from "react"
import { useZxing } from "react-zxing"
import { useHandleQrCodeRegistration } from "../../queries/use-get-queries"

interface QrCodeScannerProps {
  attendanceId: AttendanceId
}

const QrCodeScanner: FC<QrCodeScannerProps> = ({ attendanceId }) => {
  const registerAttendance = useHandleQrCodeRegistration()
  const [scannerOpen, setScannerOpen] = useState(false)
  const { ref } = useZxing({
    onDecodeResult: async (result) => {
      const userId = result.getText()
      await registerAttendance({
        userId,
        attendanceId,
      })
    },
    paused: !scannerOpen,
  })

  if (scannerOpen) {
    return (
      <div>
        <Button onClick={() => setScannerOpen(false)}>Lukk scanner</Button>
        <video ref={ref} style={{ transform: "scaleX(-1)" }}>
          <track kind="captions" src="" srcLang="en" label="English" default />
        </video>
      </div>
    )
  }
  return <Button onClick={() => setScannerOpen(true)}>Åpne scanner</Button>
}

export default QrCodeScanner
