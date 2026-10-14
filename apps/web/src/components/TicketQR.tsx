"use client"

import { PlaceHolderImage } from "@/components/atoms/PlaceHolderImage"
import type { EventType } from "@dotkomonline/rpc/event"
import { IconArrowUpRight, IconMapPin, IconTicket, IconX } from "@tabler/icons-react"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useId, useRef, useState } from "react"

const artworkClasses = "relative w-full aspect-video overflow-hidden rounded-[13px] object-cover md:rounded-[0.99cqw]"
const detailClasses = "flex items-center gap-[17px] text-inherit no-underline md:gap-[1.55cqw]"
const detailTextClasses = "flex flex-1 flex-col min-w-0 text-[4cqw] leading-[1.45] wrap-anywhere md:text-[1.69cqw]"
const iconBoxClasses =
  "flex shrink-0 items-center justify-center size-12 overflow-hidden border border-[#e5e6eb] dark:border-stone-700 rounded-[9px] md:size-[3.94cqw] md:rounded-[0.7cqw]"
const arrowClasses = "shrink-0 size-5 text-[#777c8e] dark:text-stone-300 md:size-[1.41cqw]"

export interface TicketQRProps {
  title?: string
  dateLabel?: string
  dateTime?: string
  schedule?: string
  time?: string
  month?: string
  day?: string
  location?: string
  eventType?: EventType
  imageUrl?: string
  eventHref?: string
  locationHref?: string
  ticketValue?: string
}

export function TicketQR({
  title = "Åre 2026",
  dateLabel = "15. januar",
  dateTime = "2026-01-15",
  schedule = "Torsdag 03. september",
  time = "kl. 08:30 - 10:00",
  month = "SEP",
  day = "03",
  location = "E5-101 på Realfagsbygget",
  eventType = "OTHER",
  imageUrl,
  eventHref = "/arrangementer",
  locationHref = "https://use.mazemap.com/#v=1&search=E5-101&campusid=1",
  ticketValue,
}: TicketQRProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const ticketRef = useRef<HTMLElement>(null)
  const eventRef = useRef<HTMLDivElement>(null)
  const [surface, setSurface] = useState({ width: 0, height: 0, eventHeight: 0, radius: 0, mobile: false })
  const titleId = useId()
  const surfaceId = `${titleId}-surface`

  useEffect(() => {
    const ticket = ticketRef.current
    const event = eventRef.current
    if (!ticket || !event) return

    const measure = () => {
      const { width, height } = ticket.getBoundingClientRect()
      const eventHeight = event.getBoundingClientRect().height
      const radius = Number.parseFloat(window.getComputedStyle(ticket).borderTopLeftRadius)
      const mobile = window.matchMedia("(max-width: 767px)").matches
      setSurface((previous) =>
        previous.width === width &&
        previous.height === height &&
        previous.eventHeight === eventHeight &&
        previous.radius === radius &&
        previous.mobile === mobile
          ? previous
          : { width, height, eventHeight, radius, mobile }
      )
    }

    const observer = new ResizeObserver(measure)
    observer.observe(ticket)
    observer.observe(event)
    measure()
    return () => observer.disconnect()
  }, [])

  const { eventHeight, mobile } = surface
  // A fixed desktop drawing scales with the CSS aspect ratio; mobile follows its content height.
  const width = mobile ? surface.width : 1420
  const height = mobile ? surface.height : 578
  const cornerRadius = surface.width > 0 ? (surface.radius * width) / surface.width : 0
  const frame = mobile ? 8 : 16
  const notchRadius = mobile ? 18 : 22
  const notchJoinRadius = mobile ? 4 : 6
  // Tangent arcs soften the two joins between each circular notch and the straight ticket edge.
  const notchJoinOffset = Math.sqrt(notchRadius ** 2 + 2 * notchRadius * notchJoinRadius)
  const notchTangentX = (notchJoinOffset * notchRadius) / (notchRadius + notchJoinRadius)
  const notchTangentY = (notchJoinRadius * notchRadius) / (notchRadius + notchJoinRadius)
  const notchPath = [
    `M ${-notchJoinOffset} 0`,
    `A ${notchJoinRadius} ${notchJoinRadius} 0 0 1 ${-notchTangentX} ${notchTangentY}`,
    `A ${notchRadius} ${notchRadius} 0 0 0 ${notchTangentX} ${notchTangentY}`,
    `A ${notchJoinRadius} ${notchJoinRadius} 0 0 1 ${notchJoinOffset} 0`,
    `V ${-notchJoinRadius} H ${-notchJoinOffset} Z`,
  ].join(" ")
  const seam = mobile ? eventHeight + 3 : width * 0.585 + 4
  const dashPositions: number[] = []
  const firstDash = notchRadius + (mobile ? 2 : 4)
  const lastDash = (mobile ? width : height) - firstDash - (mobile ? 16 : 18)
  const intervals = Math.max(1, Math.floor((lastDash - firstDash) / (mobile ? 18 : 20)))
  if (lastDash >= firstDash) {
    for (let index = 0; index <= intervals; index++) {
      dashPositions.push(firstDash + ((lastDash - firstDash) * index) / intervals)
    }
  }

  return (
    <article
      className="relative grid grid-cols-1 w-full overflow-hidden rounded-lg bg-transparent text-[#080808] dark:text-stone-100 font-body [--ticket-blue:var(--color-brand)] [--ticket-surface:#fff] dark:[--ticket-surface:#1c1917] drop-shadow-[0_12px_14px_rgb(0_0_0_/_18%)] md:grid-cols-[58.5%_41.5%] [container-type:inline-size] md:aspect-[1420/578] [&_a:focus-visible]:outline-3 [&_a:focus-visible]:outline-[#5575cb] [&_a:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-3 [&_button:focus-visible]:outline-[#5575cb] [&_button:focus-visible]:outline-offset-4"
      ref={ticketRef}
      aria-label={`Billett til ${title}`}
    >
      {width > 0 && height > 0 && (
        <svg
          className="absolute inset-0 size-full pointer-events-none"
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
        >
          <defs>
            <mask id={surfaceId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
              <rect width={width} height={height} rx={cornerRadius} fill="white" />
              <path
                d={notchPath}
                transform={mobile ? `translate(0 ${seam}) rotate(-90)` : `translate(${seam} 0)`}
                fill="black"
              />
              <path
                d={notchPath}
                transform={
                  mobile ? `translate(${width} ${seam}) rotate(90)` : `translate(${seam} ${height}) rotate(180)`
                }
                fill="black"
              />
              {dashPositions.map((position) => (
                <rect
                  key={position}
                  x={mobile ? position + 1 : seam - 2.5}
                  y={mobile ? seam - 2 : position + 1}
                  width={mobile ? 14 : 5}
                  height={mobile ? 4 : 16}
                  rx={mobile ? 2 : 2.5}
                  fill="black"
                />
              ))}
            </mask>
          </defs>
          <g mask={`url(#${surfaceId})`}>
            <rect width={width} height={height} fill="var(--ticket-surface)" />
            <rect
              x={frame / 2}
              y={frame / 2}
              width={width - frame}
              height={height - frame}
              rx={Math.max(0, cornerRadius - frame / 2)}
              fill="none"
              stroke="var(--ticket-blue)"
              strokeWidth={frame}
            />
            {[
              [frame, frame],
              [width - frame, frame],
              [frame, height - frame],
              [width - frame, height - frame],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={mobile ? 24 : 38} fill="var(--ticket-blue)" />
            ))}
            <circle
              cx={mobile ? 0 : seam}
              cy={mobile ? seam : 0}
              r={notchRadius + frame / 2}
              fill="none"
              stroke="var(--ticket-blue)"
              strokeWidth={frame}
            />
            <circle
              cx={mobile ? width : seam}
              cy={mobile ? seam : height}
              r={notchRadius + frame / 2}
              fill="none"
              stroke="var(--ticket-blue)"
              strokeWidth={frame}
            />
          </g>
        </svg>
      )}
      <div
        className="relative flex items-center justify-center p-8 md:p-[4.36cqw] md:min-w-0 md:min-h-0"
        ref={eventRef}
      >
        <a
          className="flex flex-col w-full max-w-[480px] gap-3 p-2.5 border border-[#eff0f3] dark:border-stone-700 rounded-[17px] bg-[#f8f9fa] dark:bg-stone-800 text-inherit no-underline md:w-[40.5cqw] md:max-w-full md:gap-[0.85cqw] md:p-[0.85cqw] md:rounded-[1.41cqw]"
          href={eventHref}
        >
          {imageUrl ? (
            // biome-ignore lint/performance/noImgElement: follows the existing event image convention
            <img className={artworkClasses} src={imageUrl} alt={title} />
          ) : (
            <div className={`${artworkClasses} bg-gray-100 dark:bg-stone-800/50`}>
              <PlaceHolderImage variant={eventType} className="size-full object-contain" />
            </div>
          )}
          <h2 className="m-0 text-[7cqw] font-medium leading-[1.2] md:text-[2.96cqw]">{title}</h2>
          <time className="mb-0.5 text-[5cqw] leading-[1.3] md:mb-[0.14cqw] md:text-[2.11cqw]" dateTime={dateTime}>
            {dateLabel}
          </time>
        </a>
      </div>

      <div className="relative flex flex-col justify-end gap-8 py-7 px-6 border-t-[6px] border-transparent md:min-w-0 md:min-h-0 md:gap-[6.06cqw] md:py-[5.92cqw] md:px-[4.23cqw] md:border-t-0 md:border-l-[0.56cqw]">
        <div className="flex flex-col gap-[26px] md:gap-[2.54cqw]">
          <a className={detailClasses} href={eventHref}>
            <span className={`${iconBoxClasses} flex-col`} aria-hidden="true">
              <span className="w-full bg-[#e6e7ec] dark:bg-stone-700 text-[#777c8e] dark:text-stone-300 text-center text-[2.75cqw] font-medium leading-[4.75cqw] md:text-[0.99cqw] md:leading-[1.55cqw]">
                {month}
              </span>
              <strong className="text-[5cqw] font-normal leading-[7cqw] md:text-[1.83cqw] md:leading-[2.25cqw]">
                {day}
              </strong>
            </span>
            <span className={detailTextClasses}>
              <span>{schedule}</span>
              <span>{time}</span>
            </span>
            <IconArrowUpRight className={arrowClasses} aria-hidden="true" />
          </a>
          <a className={detailClasses} href={locationHref} target="_blank" rel="noreferrer">
            <span className={iconBoxClasses}>
              <IconMapPin
                className="size-[27px] text-[#777c8e] dark:text-stone-300 md:size-[2.11cqw]"
                aria-hidden="true"
              />
            </span>
            <span className={detailTextClasses}>{location}</span>
            <IconArrowUpRight className={arrowClasses} aria-hidden="true" />
          </a>
        </div>
        <button
          className="flex items-center justify-center self-center w-full max-w-[80%] min-h-16 gap-3 border-0 rounded-[15px] bg-[#e6e7eb] dark:bg-stone-700 text-[#191e2c] dark:text-stone-100 text-[5cqw] font-semibold cursor-pointer transition-colors duration-150 ease-[ease] hover:bg-[#d9dbe2] dark:hover:bg-stone-600 md:max-w-[23.66cqw] md:min-h-[7.46cqw] md:gap-[1.13cqw] md:rounded-[1.41cqw] md:text-[2.11cqw]"
          type="button"
          onClick={() => dialogRef.current?.showModal()}
        >
          <IconTicket className="size-[27px] md:size-[2.11cqw]" aria-hidden="true" />
          Vis billett
        </button>
      </div>

      <dialog
        className="fixed inset-0 w-[min(420px,calc(100vw-32px))] m-auto p-6 border-0 rounded-[20px] bg-white dark:bg-stone-900 text-[#191e2c] dark:text-stone-100 backdrop:bg-black/55 [&_p]:mt-4"
        ref={dialogRef}
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[20px] font-semibold" id={titleId}>
            {ticketValue ? "Din billett" : "Forhåndsvisning av billett"}
          </h2>
          <button
            className="grid place-items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-stone-800"
            type="button"
            aria-label="Lukk billett"
            onClick={() => dialogRef.current?.close()}
          >
            <IconX />
          </button>
        </div>
        <p className="text-2xl font-semibold">{title}</p>
        {ticketValue ? (
          <QRCodeSVG
            className="w-full max-w-[280px] h-auto my-6 mx-auto bg-white rounded-lg"
            value={ticketValue}
            size={280}
            level="Q"
            marginSize={4}
            title={`Billett til ${title}`}
          />
        ) : (
          <p>Dette er en eksempelbillett. QR-koden vises her når en billett er tilgjengelig.</p>
        )}
        <p>
          {dateLabel} · {location}
        </p>
      </dialog>
    </article>
  )
}
