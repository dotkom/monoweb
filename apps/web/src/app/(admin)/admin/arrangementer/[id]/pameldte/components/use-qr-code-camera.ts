import { BrowserQRCodeReader } from "@zxing/browser"
import { useEffect, useEffectEvent, useState } from "react"

const SCAN_INTERVAL_MILLISECONDS = 150

interface UseQrCodeCameraOptions {
  constraints: MediaStreamConstraints
  isEnabled: boolean
  onDecodeResult: (value: string) => void
  onReady: (stream: MediaStream) => void
}

export function useQrCodeCamera({ constraints, isEnabled, onDecodeResult, onReady }: UseQrCodeCameraOptions) {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionNumber, setSessionNumber] = useState(0)

  const handleDecodeResult = useEffectEvent(onDecodeResult)
  const handleReady = useEffectEvent(onReady)

  const retry = () => {
    setSessionNumber((currentSessionNumber) => currentSessionNumber + 1)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: sessionNumber explicitly restarts interrupted cameras and retries failed access.
  useEffect(() => {
    setIsReady(false)
    setError(null)

    if (!isEnabled || videoElement === null) {
      return
    }

    const reader = new BrowserQRCodeReader()

    let isDisposed = false
    let isPlaybackPending = false
    let stream: MediaStream | null = null
    let scanTimeout: ReturnType<typeof setTimeout> | undefined

    const handleTrackEnded = () => {
      if (!isDisposed) {
        setSessionNumber((currentSessionNumber) => currentSessionNumber + 1)
      }
    }

    const stopStream = () => {
      for (const track of stream?.getTracks() ?? []) {
        track.removeEventListener("ended", handleTrackEnded)
        track.stop()
      }

      if (videoElement.srcObject === stream) {
        videoElement.pause()
        videoElement.srcObject = null
      }
    }

    const playVideo = async () => {
      if (isDisposed || isPlaybackPending || !videoElement.paused) {
        return
      }

      isPlaybackPending = true

      try {
        await videoElement.play()
      } finally {
        isPlaybackPending = false
      }
    }

    const scan = () => {
      if (isDisposed) {
        return
      }

      let scannedValue: string | null = null

      try {
        const hasVideoFrame = videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA

        if (hasVideoFrame && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          const result = reader.decode(videoElement)

          scannedValue = result.getText()
        }
      } catch {
        // Missing codes and temporarily unavailable video frames must not end the scan loop
      } finally {
        scanTimeout = setTimeout(() => scan(), SCAN_INTERVAL_MILLISECONDS)
      }

      if (scannedValue !== null) {
        handleDecodeResult(scannedValue)
      }
    }

    const reportCameraError = () => {
      if (!isDisposed) {
        clearTimeout(scanTimeout)
        stopStream()
        setIsReady(false)
        setError("Kunne ikke starte kameraet. Prøv igjen.")
      }
    }

    const startCamera = async () => {
      try {
        const acquiredStream = await navigator.mediaDevices.getUserMedia(constraints)

        if (isDisposed) {
          for (const track of acquiredStream.getTracks()) {
            track.stop()
          }

          return
        }

        stream = acquiredStream

        for (const track of stream.getVideoTracks()) {
          track.addEventListener("ended", handleTrackEnded)
        }

        videoElement.srcObject = stream
        await playVideo()

        if (isDisposed) {
          return
        }

        setIsReady(true)
        handleReady(stream)
        scan()
      } catch {
        reportCameraError()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && stream !== null) {
        void playVideo().catch(reportCameraError)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    void startCamera()

    return () => {
      isDisposed = true
      clearTimeout(scanTimeout)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      stopStream()
    }
  }, [constraints, isEnabled, sessionNumber, videoElement])

  return { ref: setVideoElement, isReady: isEnabled && isReady, error, retry }
}
