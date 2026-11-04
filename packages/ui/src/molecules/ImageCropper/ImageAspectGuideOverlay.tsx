import type { AspectRatio } from "../ImageInput/ImageInput"

export type ImageAspectGuideOverlayProps = {
  outerAspectRatio: AspectRatio
  innerAspectRatio: AspectRatio
}

export function ImageAspectGuideOverlay({ outerAspectRatio, innerAspectRatio }: ImageAspectGuideOverlayProps) {
  const outerAspect = outerAspectRatio.width / outerAspectRatio.height
  const innerAspect = innerAspectRatio.width / innerAspectRatio.height
  const isFullHeight = innerAspect <= outerAspect

  if (isFullHeight) {
    const widthPercent = (innerAspect / outerAspect) * 100
    const sidePercent = (100 - widthPercent) / 2

    return (
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute inset-y-0 left-0 bg-black/28" style={{ width: `${sidePercent}%` }} />
        <div className="absolute inset-y-0 right-0 bg-black/28" style={{ width: `${sidePercent}%` }} />
        <div
          className="absolute inset-y-0 border-[1.5px] border-white/85 shadow-[0_0_2px_rgba(0,0,0,0.6)]"
          style={{ left: `${sidePercent}%`, width: `${widthPercent}%` }}
        />
      </div>
    )
  }

  const heightPercent = (outerAspect / innerAspect) * 100
  const sidePercent = (100 - heightPercent) / 2

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute inset-x-0 top-0 bg-black/28" style={{ height: `${sidePercent}%` }} />
      <div className="absolute inset-x-0 bottom-0 bg-black/28" style={{ height: `${sidePercent}%` }} />
      <div
        className="absolute inset-x-0 border-[1.5px] border-white/85 shadow-[0_0_2px_rgba(0,0,0,0.6)]"
        style={{ top: `${sidePercent}%`, height: `${heightPercent}%` }}
      />
    </div>
  )
}
