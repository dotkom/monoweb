import { Button } from "@mantine/core"
import { FC, useState } from "react"
import { useZxing } from "react-zxing"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"

interface ViewFinderProps {
  data: string
  resetResult: (value: string) => void
}

const ViewFinder = ({ data, resetResult }: ViewFinderProps) => {
  if (data === "") {
    return null
  }
  const updateAttendance1 = useUpdateEventAttendanceMutation()
  return (
    <div
      style={{
        top: 0,
        left: 0,
        zIndex: 10,
        background: "rgba(0, 0, 0, 0.5)",
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button
        onClick={() => {
          const userId = data.split("/")[0]
          const attendanceId = data.split("/")[1]
          updateAttendance1.mutate({ userId, attendanceId, attended: true })
          resetResult("")
        }}
      >
        Møtt
      </Button>
    </div>
  )
}

const AttendanceQrReader: FC = () => {
  const [result, setResult] = useState("")
  const [paused, setPaused] = useState(true)

  const { ref } = useZxing({
    timeBetweenDecodingAttempts: 500,
    paused,
    onDecodeResult(result) {
      setResult(result.getText())
    },
    onDecodeError(error) {
      // eslint-disable-next-line no-console
      console.log(error)
    },
    onError(error) {
      // eslint-disable-next-line no-console
      console.error(error)
    },
  })

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {!paused && (
          <div style={{ position: "relative", width: "50%" }}>
            <video ref={ref} style={{ width: "100%" }} />
            <ViewFinder data={result} resetResult={setResult} />
          </div>
        )}
      </div>

      <Button onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</Button>
      <p>
        <span>Last result:</span>
        <span>{result}</span>
      </p>
    </>
  )
}

export default AttendanceQrReader
