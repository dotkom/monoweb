"use client"

import { IconArrowUpRight, IconMapPin, IconTicket, IconX } from "@tabler/icons-react"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useId, useRef, useState } from "react"

const artworkClasses = "relative w-full aspect-video overflow-hidden rounded-[13px] object-cover md:rounded-[0.99cqw]"
const detailClasses = "flex items-center gap-[17px] text-inherit no-underline md:gap-[1.55cqw]"
const detailTextClasses =
  "flex flex-1 flex-col min-w-0 text-[clamp(15px,1.65vw,19px)] leading-[1.45] wrap-anywhere md:text-[1.69cqw]"
const iconBoxClasses =
  "flex shrink-0 items-center justify-center size-12 overflow-hidden border border-[#e5e6eb] rounded-[9px] md:size-[3.94cqw] md:rounded-[0.7cqw]"
const arrowClasses = "shrink-0 size-5 text-[#777c8e] md:size-[1.41cqw]"

export interface TicketQRProps {
  title?: string
  dateLabel?: string
  dateTime?: string
  schedule?: string
  time?: string
  month?: string
  day?: string
  location?: string
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
  imageUrl,
  eventHref = "/arrangementer",
  locationHref = "https://use.mazemap.com/#v=1&search=E5-101&campusid=1",
  ticketValue,
}: TicketQRProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const ticketRef = useRef<HTMLElement>(null)
  const eventRef = useRef<HTMLDivElement>(null)
  const [surface, setSurface] = useState({ width: 0, height: 0, eventHeight: 0, mobile: false })
  const titleId = useId()
  const surfaceId = `${titleId}-surface`

  useEffect(() => {
    const ticket = ticketRef.current
    const event = eventRef.current
    if (!ticket || !event) return

    const measure = () => {
      const { width, height } = ticket.getBoundingClientRect()
      const eventHeight = event.getBoundingClientRect().height
      const mobile = window.matchMedia("(max-width: 767px)").matches
      setSurface((previous) =>
        previous.width === width &&
        previous.height === height &&
        previous.eventHeight === eventHeight &&
        previous.mobile === mobile
          ? previous
          : { width, height, eventHeight, mobile }
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
  const frame = mobile ? 8 : 16
  const notchRadius = mobile ? 18 : 22
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
      className="relative grid grid-cols-1 w-full overflow-hidden rounded-lg bg-transparent text-[#080808] font-body [--ticket-blue:#0b5374] drop-shadow-[0_12px_14px_rgb(0_0_0_/_18%)] md:grid-cols-[58.5%_41.5%] md:[container-type:inline-size] md:aspect-[1420/578] md:rounded-none [&_a:focus-visible]:outline-3 [&_a:focus-visible]:outline-[#5575cb] [&_a:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-3 [&_button:focus-visible]:outline-[#5575cb] [&_button:focus-visible]:outline-offset-4"
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
              <rect width={width} height={height} rx="8" fill="white" />
              <circle cx={mobile ? 0 : seam} cy={mobile ? seam : 0} r={notchRadius} fill="black" />
              <circle cx={mobile ? width : seam} cy={mobile ? seam : height} r={notchRadius} fill="black" />
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
            <rect width={width} height={height} fill="white" />
            <rect
              x={frame / 2}
              y={frame / 2}
              width={width - frame}
              height={height - frame}
              rx="4"
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
        className="relative flex items-center justify-center p-8 md:justify-start md:p-[4.36cqw] md:min-w-0 md:min-h-0"
        ref={eventRef}
      >
        <a
          className="flex flex-col w-full max-w-[480px] gap-3 p-2.5 border border-[#eff0f3] rounded-[17px] bg-[#f8f9fa] text-inherit no-underline md:w-[40.5cqw] md:max-w-full md:gap-[0.85cqw] md:p-[0.85cqw] md:rounded-[1.41cqw]"
          href={eventHref}
        >
          {imageUrl ? (
            // biome-ignore lint/performance/noImgElement: follows the existing event image convention
            <img className={artworkClasses} src={imageUrl} alt={title} />
          ) : (
            <div className={`${artworkClasses} bg-[linear-gradient(115deg,#fcfdff,#d6e0ff)]`} aria-hidden="true">
              <svg
                className="size-full"
                viewBox="0 0 640 360"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <path d="M0 278 128 141 188 180 293 270 390 224 449 247 505 286 640 174V360H0Z" fill="#9abbac" />
                <path d="m0 278 128-137 5 17-4 15 12 13-14 32 16-10 19 13 9 30 38 29 47 70H0Z" fill="#ffffef" />
                <path
                  d="m37 360 41-67 41-29-23 37-17 14-19 45Zm93 0 15-58-7-44 11-27 4 53 25 23-20 19-9 34Z"
                  fill="#9abbac"
                />
                <path d="m284 286 106-62-9 12 20 18-15-3-19 14-10-1-20 16-26 5Z" fill="#ffffef" />
                <path d="m362 253 13 13 5 19 22 5-17-15-3-16Z" fill="#ffffef" />
                <path d="m293 360 347-186v186Z" fill="white" />
                <path d="M317 283v66" stroke="#b09a6b" strokeWidth="12" />
                <path d="m287 280 17-10h47l10 10-13 9h-61Zm0 23 15-11h48v20h-48Z" fill="#dccba7" />
                <text x="324" y="284" textAnchor="middle" fill="#24241d" fontSize="11" fontStyle="italic">
                  Après ski
                </text>
                <text x="324" y="307" textAnchor="middle" fill="#24241d" fontSize="11" fontStyle="italic">
                  Bygget
                </text>
                <g fill="#080a09" stroke="#080a09" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="514" cy="224" r="10" stroke="none" />
                  <path d="m522 232 16 24-8 20-28 8-12 22-21 8" strokeWidth="15" />
                  <path d="m518 240-19 14-8-4m41 13-23 18-7 23" strokeWidth="9" />
                  <path d="m459 316 37-14m-22 21 38-21m-14-61 5-42m19 69 80 9" strokeWidth="2" />
                </g>
              </svg>
              <div className="absolute top-[29%] left-1/2 flex flex-col items-center -translate-x-1/2 leading-none">
                <strong className="[font-family:Impact,'Arial_Narrow',sans-serif] text-[clamp(42px,11vw,64px)] tracking-[-3px] md:text-[6.2cqw] md:tracking-[-0.21cqw]">
                  ÅRE
                </strong>
                <span className="text-[clamp(18px,2.3vw,27px)] md:text-[2.4cqw]">2026</span>
              </div>
            </div>
          )}
          <h2 className="m-0 text-[clamp(26px,3vw,34px)] font-medium leading-[1.2] md:text-[2.96cqw]">{title}</h2>
          <time
            className="mb-0.5 text-[clamp(19px,2vw,24px)] leading-[1.3] md:mb-[0.14cqw] md:text-[2.11cqw]"
            dateTime={dateTime}
          >
            {dateLabel}
          </time>
        </a>
      </div>

      <div className="relative flex flex-col justify-end gap-8 py-7 px-6 border-t-[6px] border-transparent md:min-w-0 md:min-h-0 md:gap-[6.06cqw] md:py-[5.92cqw] md:px-[4.23cqw] md:border-t-0 md:border-l-[0.56cqw]">
        <div className="flex flex-col gap-[26px] md:gap-[2.54cqw]">
          <a className={detailClasses} href={eventHref}>
            <span className={`${iconBoxClasses} flex-col`} aria-hidden="true">
              <span className="w-full bg-[#e6e7ec] text-[#777c8e] text-center text-[11px] font-medium leading-[19px] md:text-[0.99cqw] md:leading-[1.55cqw]">
                {month}
              </span>
              <strong className="text-[20px] font-normal leading-[28px] md:text-[1.83cqw] md:leading-[2.25cqw]">
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
              <IconMapPin className="size-[27px] text-[#777c8e] md:size-[2.11cqw]" aria-hidden="true" />
            </span>
            <span className={detailTextClasses}>{location}</span>
            <IconArrowUpRight className={arrowClasses} aria-hidden="true" />
          </a>
        </div>
        <button
          className="flex items-center justify-center self-center w-full min-h-16 gap-3 border-0 rounded-[15px] bg-[#e6e7eb] text-[#191e2c] text-[20px] font-semibold cursor-pointer transition-colors duration-150 ease-[ease] hover:bg-[#d9dbe2] md:max-w-[23.66cqw] md:min-h-[7.46cqw] md:gap-[1.13cqw] md:rounded-[1.41cqw] md:text-[2.11cqw]"
          type="button"
          onClick={() => dialogRef.current?.showModal()}
        >
          <IconTicket className="size-[27px] md:size-[2.11cqw]" aria-hidden="true" />
          Vis billett
        </button>
      </div>

      <dialog
        className="fixed inset-0 w-[min(420px,calc(100vw-32px))] m-auto p-6 border-0 rounded-[20px] bg-white text-[#191e2c] backdrop:bg-black/55 [&_p]:mt-4"
        ref={dialogRef}
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[20px] font-semibold" id={titleId}>
            {ticketValue ? "Din billett" : "Forhåndsvisning av billett"}
          </h2>
          <button
            className="grid place-items-center p-2 rounded-lg cursor-pointer"
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
            className="w-full max-w-[280px] h-auto my-6 mx-auto"
            value={ticketValue}
            size={280}
            level="Q"
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
