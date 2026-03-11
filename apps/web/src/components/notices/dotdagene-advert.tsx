// TODO: delete this file
// biome-ignore-all lint: god be with you if you try to fix this

import { Text } from "@dotkomonline/ui"
import { IconArrowUpRight, IconClock } from "@tabler/icons-react"
import { formatDistanceToNow, type Interval, isWithinInterval } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import { useId, type CSSProperties } from "react"

// Datatyper for animasjonsnoder og tuningsverdier.
type EdgeBubble = {
  top: string
  size: string
  distance: string
  duration: string
  delay: string
  waveDelay: string
  waveAmplitude: string
}

type EdgeWaveNode = {
  top: string
  size: string
  duration: string
  delay: string
}

export type DotdageneHeaderTuning = {
  bubbleCount: number
  bubbleSizeBase: number
  bubbleSizeStep: number
  distanceBase: number
  distanceStep: number
  durationBase: number
  durationStep: number
  waveAmplitudeBase: number
  waveAmplitudeStep: number
  edgeWidth: number
  blur: number
  edgeWaveDuration: number
  edgeWobble: number
  headerBorderWidth: number
}

type DotdageneHeaderBrowserProfile = "apple_webkit" | "chrome" | "default"

// Standardprofiler per browser.
const chromeDefaultDotdageneHeaderTuning: DotdageneHeaderTuning = {
  bubbleCount: 12,
  bubbleSizeBase: 0.68,
  bubbleSizeStep: 0.16,
  distanceBase: 4.4,
  distanceStep: 0.82,
  durationBase: 2.15,
  durationStep: 0.18,
  waveAmplitudeBase: 0.12,
  waveAmplitudeStep: 0.05,
  edgeWidth: 11,
  blur: 6.5,
  edgeWaveDuration: 2.2,
  edgeWobble: 0.55,
  headerBorderWidth: 3.75,
}

const appleWebKitDefaultDotdageneHeaderTuning: DotdageneHeaderTuning = {
  bubbleCount: 7,
  bubbleSizeBase: 0.2,
  bubbleSizeStep: 0.24,
  distanceBase: 5.5,
  distanceStep: 0.78,
  durationBase: 3.1,
  durationStep: 0.18,
  waveAmplitudeBase: 0.69,
  waveAmplitudeStep: 0,
  edgeWidth: 4,
  blur: 2,
  edgeWaveDuration: 2.15,
  edgeWobble: 0.14,
  headerBorderWidth: 3.75,
}

// Enkel browserdeteksjon for valg av korrekt animasjonsprofil.
const getDotdageneHeaderBrowserProfile = (): DotdageneHeaderBrowserProfile => {
  if (typeof navigator === "undefined") {
    return "default"
  }

  const ua = navigator.userAgent
  const vendor = navigator.vendor || ""
  const platform = navigator.platform || ""
  const maxTouchPoints = navigator.maxTouchPoints || 0

  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1)
  const isAppleWebKit = /AppleWebKit\//i.test(ua)
  const isSafariDesktop =
    /Safari\//i.test(ua) && /Apple/i.test(vendor) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox/i.test(ua)

  if ((isIOS && isAppleWebKit) || isSafariDesktop) {
    return "apple_webkit"
  }

  const isChrome =
    (/Chrome\//i.test(ua) || /CriOS\//i.test(ua)) &&
    !/Edg\//i.test(ua) &&
    !/OPR\//i.test(ua) &&
    !/SamsungBrowser\//i.test(ua)

  if (isChrome) {
    return "chrome"
  }

  return "default"
}

const getDefaultDotdageneHeaderTuningForBrowser = (profile: DotdageneHeaderBrowserProfile): DotdageneHeaderTuning => {
  if (profile === "apple_webkit") {
    return { ...appleWebKitDefaultDotdageneHeaderTuning }
  }

  if (profile === "chrome") {
    return { ...chromeDefaultDotdageneHeaderTuning }
  }

  return { ...chromeDefaultDotdageneHeaderTuning }
}

const getDefaultDotdageneHeaderTuningForCurrentBrowser = (): DotdageneHeaderTuning =>
  getDefaultDotdageneHeaderTuningForBrowser(getDotdageneHeaderBrowserProfile())

// Generatorer som lager partikkel- og kantdata med litt variasjon.
const createEdgeBubbles = (phase: number, tuning: DotdageneHeaderTuning): EdgeBubble[] =>
  Array.from({ length: Math.max(1, Math.round(tuning.bubbleCount)) }, (_, index) => ({
    top: `${-8 + (((index + phase) * 17) % 116)}%`,
    size: `${tuning.bubbleSizeBase + (((index + phase) * 5) % 8) * tuning.bubbleSizeStep}rem`,
    distance: `${tuning.distanceBase + (((index + phase) * 7) % 7) * tuning.distanceStep}rem`,
    duration: `${tuning.durationBase + (((index + phase) * 3) % 7) * tuning.durationStep}s`,
    delay: `${-(((index + phase) * 2) % 12) * 0.28}s`,
    waveDelay: `${-(((index + phase) * 3) % 16) * 0.14}s`,
    waveAmplitude: `${tuning.waveAmplitudeBase + (((index + phase) * 5) % 5) * tuning.waveAmplitudeStep}rem`,
  }))

const createEdgeWaveNodes = (phase: number, tuning: DotdageneHeaderTuning): EdgeWaveNode[] =>
  Array.from({ length: 9 }, (_, index) => ({
    top: `${-10 + (((index + phase) * 13) % 122)}%`,
    size: `${0.9 + (((index + phase) * 5) % 6) * 0.16}rem`,
    duration: `${tuning.edgeWaveDuration * (0.82 + (((index + phase) * 3) % 5) * 0.08)}s`,
    delay: `${-(((index + phase) * 4) % 14) * 0.21}s`,
  }))

// Mapper genererte verdier til CSS custom properties.
const bubbleStyle = (bubble: EdgeBubble): CSSProperties =>
  ({
    "--bubble-top": bubble.top,
    "--bubble-size": bubble.size,
    "--bubble-distance": bubble.distance,
    "--bubble-duration": bubble.duration,
    "--bubble-delay": bubble.delay,
    "--bubble-wave-delay": bubble.waveDelay,
    "--bubble-wave-amplitude": bubble.waveAmplitude,
  }) as CSSProperties

const edgeWaveNodeStyle = (node: EdgeWaveNode): CSSProperties =>
  ({
    "--edge-wave-top": node.top,
    "--edge-wave-size": node.size,
    "--edge-wave-duration": node.duration,
    "--edge-wave-delay": node.delay,
  }) as CSSProperties

// Lokale farger for komponenten (ingen ekstern CSS-avhengighet).
const colors = {
  green: "hsl(87deg 23% 44%)",
  yellow: "hsl(45deg 80% 59%)",
  purple: "hsl(266deg 53% 70%)",
}

type DotdageneHeaderProps = {
  logoSrc?: string
  logoAlt?: string
  dateText?: string
  className?: string
  logoFallbackText?: string
}

const DotdageneHeader = ({
  logoSrc,
  logoAlt = "dotDAGENE",
  dateText = "3. mars",
  className = "",
  logoFallbackText = "dotDAGENE",
}: DotdageneHeaderProps) => {
  // Velg tuning automatisk ut fra gjeldende browserprofil.
  const resolvedTuning: DotdageneHeaderTuning = getDefaultDotdageneHeaderTuningForCurrentBrowser()

  // Bygg venstre/høyre animasjonsdata for kanten mot midten.
  const yellowEdgeBubbles: EdgeBubble[] = createEdgeBubbles(0, resolvedTuning)
  const purpleEdgeBubbles: EdgeBubble[] = createEdgeBubbles(3, resolvedTuning)
  const yellowEdgeWaveNodes: EdgeWaveNode[] = createEdgeWaveNodes(0, resolvedTuning)
  const purpleEdgeWaveNodes: EdgeWaveNode[] = createEdgeWaveNodes(2, resolvedTuning)

  // Avledede posisjoner for emitter og bølgekjerne.
  const edgeHalf = resolvedTuning.edgeWidth / 2
  const edgeSourceNudgeRem = 0.2
  const emitterOffset = Math.max(0.4, edgeHalf - 0.3 + edgeSourceNudgeRem)
  const emitterWaveOffset = Math.max(0.2, emitterOffset - 0.18)
  const gooeyFilterId = useId().replace(/:/g, "")
  const edgeFilterStyle: CSSProperties = { filter: `url('#${gooeyFilterId}')` }
  const headerClassName = ["dd-dotdagene-header w-full", className].filter(Boolean).join(" ")

  // Per-instans CSS-variabler slik at flere headere kan stå på samme side.
  const headerStyleVars = {
    "--dd-header-border-width": `${resolvedTuning.headerBorderWidth}px`,
    "--dd-edge-width": `${resolvedTuning.edgeWidth}rem`,
    "--dd-edge-half": `${edgeHalf}rem`,
    "--dd-emitter-offset": `${emitterOffset}rem`,
    "--dd-emitter-wave-offset": `${emitterWaveOffset}rem`,
    "--dd-edge-wobble": `${resolvedTuning.edgeWobble}rem`,
  } as CSSProperties

  return (
    <a
      href="https://online.ntnu.no/arrangementer/dotDAGENE-2026/bed5544b-b062-4860-a65a-8549d83e4629"
      className={headerClassName}
      style={headerStyleVars}
    >
      {/* All styling er kapslet i komponenten for enkel flytting mellom prosjekter. */}
      <style>
        {`
          .dd-dotdagene-header {
            width: 100%;
          }

          .dd-dotdagene-header__container {
            position: relative;
            margin: 0 auto;
            overflow: hidden;
            border-radius: .9rem;
            background: ${colors.green};
          }

          .dd-dotdagene-header__defs {
            position: absolute;
            width: 0;
            height: 0;
          }

          .dd-dotdagene-header__grid {
            position: relative;
            z-index: 2;
            display: grid;
            min-height: 4.1rem;
            grid-template-columns: 1.25fr 1fr;
          }

          .dd-dotdagene-header__segment {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.3rem 1.2rem;
          }

          .dd-dotdagene-header__left {
            background: ${colors.yellow};
          }

          .dd-dotdagene-header__middle {
            display: none;
            background: ${colors.green};
          }

          .dd-dotdagene-header__right {
            justify-content: center;
            padding: 0.3rem 0.9rem;
            background: ${colors.purple};
          }

          .dd-dotdagene-header__logo {
            position: relative;
            z-index: 2;
            width: auto;
            max-width: 100%;
            height: 2.5rem;
            object-fit: contain;
          }

          .dd-dotdagene-header__logo-fallback {
            position: relative;
            z-index: 2;
            color: #1f1f1f;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(1.5rem, 4vw, 2.5rem);
            font-weight: 700;
            line-height: 1;
            letter-spacing: 0.01em;
            white-space: nowrap;
          }

          .dd-dotdagene-header__date {
            position: relative;
            z-index: 2;
            margin: 0;
            color: #000;
            font-weight: 500;
            line-height: 1;
            white-space: nowrap;
            font-size: clamp(1rem, 3.8vw, 1.75rem);
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }

          .dd-dotdagene-header__edge {
            position: absolute;
            top: -1.2rem;
            bottom: -1.2rem;
            width: var(--dd-edge-width, 11rem);
            pointer-events: none;
            z-index: 1;
            transform: translateZ(0);
            backface-visibility: hidden;
          }

          .dd-dotdagene-header__edge-left {
            right: calc(-1 * var(--dd-edge-half, 5.5rem));
          }

          .dd-dotdagene-header__edge-right {
            left: calc(-1 * var(--dd-edge-half, 5.5rem));
          }

          .dd-dotdagene-header__edge-wave {
            position: absolute;
            top: -8%;
            bottom: -8%;
            width: 1.3rem;
          }

          .dd-dotdagene-header__edge-left .dd-dotdagene-header__edge-wave {
            right: var(--dd-emitter-wave-offset, 0.8rem);
          }

          .dd-dotdagene-header__edge-right .dd-dotdagene-header__edge-wave {
            left: var(--dd-emitter-wave-offset, 0.8rem);
          }

          .dd-dotdagene-header__edge-wave-base {
            position: absolute;
            top: -5%;
            bottom: -5%;
            width: 0.26rem;
            border-radius: 9999px;
            opacity: 0.72;
          }

          .dd-dotdagene-header__edge-left .dd-dotdagene-header__edge-wave-base {
            right: 0;
            background: ${colors.yellow};
          }

          .dd-dotdagene-header__edge-right .dd-dotdagene-header__edge-wave-base {
            left: 0;
            background: ${colors.purple};
          }

          .dd-dotdagene-header__edge-wave-node {
            position: absolute;
            top: var(--edge-wave-top, 50%);
            width: var(--edge-wave-size, 1rem);
            height: calc(var(--edge-wave-size, 1rem) * 1.22);
            border-radius: 9999px;
            transform: translateY(-50%);
            will-change: transform;
          }

          .dd-dotdagene-header__edge-left .dd-dotdagene-header__edge-wave-node {
            right: 0;
            background: ${colors.yellow};
            animation: dd-dotdagene-edge-wave-left var(--edge-wave-duration, 2s) ease-in-out infinite var(--edge-wave-delay, 0s);
          }

          .dd-dotdagene-header__edge-right .dd-dotdagene-header__edge-wave-node {
            left: 0;
            background: ${colors.purple};
            animation: dd-dotdagene-edge-wave-right var(--edge-wave-duration, 2s) ease-in-out infinite var(--edge-wave-delay, 0s);
          }

          .dd-dotdagene-header__edge-bubble {
            position: absolute;
            top: var(--bubble-top, 50%);
            width: var(--bubble-size, 0.8rem);
            height: var(--bubble-size, 0.8rem);
            border-radius: 9999px;
            transform: translate3d(0, -50%, 0) scale(0.65);
            opacity: 0.94;
            will-change: transform, opacity;
            backface-visibility: hidden;
          }

          .dd-dotdagene-header__edge-left .dd-dotdagene-header__edge-bubble {
            right: var(--dd-emitter-offset, 1rem);
            background: ${colors.yellow};
            animation:
              dd-dotdagene-gooey-edge-flow-right var(--bubble-duration, 2.8s) linear infinite var(--bubble-delay, 0s),
              dd-dotdagene-gooey-source-wave calc(var(--bubble-duration, 2.8s) * 0.95) ease-in-out infinite var(--bubble-wave-delay, 0s);
          }

          .dd-dotdagene-header__edge-right .dd-dotdagene-header__edge-bubble {
            left: var(--dd-emitter-offset, 1rem);
            background: ${colors.purple};
            animation:
              dd-dotdagene-gooey-edge-flow-left var(--bubble-duration, 2.8s) linear infinite var(--bubble-delay, 0s),
              dd-dotdagene-gooey-source-wave calc(var(--bubble-duration, 2.8s) * 0.95) ease-in-out infinite var(--bubble-wave-delay, 0s);
          }

          @keyframes dd-dotdagene-edge-wave-left {
            0%,
            100% {
              transform: translate3d(calc(-1 * var(--dd-edge-wobble, 0.55rem)), -50%, 0) scaleX(0.84);
            }

            25% {
              transform: translate3d(calc(var(--dd-edge-wobble, 0.55rem) * 0.35), calc(-50% - 0.14rem), 0) scaleX(1.04);
            }

            50% {
              transform: translate3d(var(--dd-edge-wobble, 0.55rem), -50%, 0) scaleX(1.12);
            }

            75% {
              transform: translate3d(calc(-1 * var(--dd-edge-wobble, 0.55rem) * 0.38), calc(-50% + 0.12rem), 0) scaleX(0.94);
            }
          }

          @keyframes dd-dotdagene-edge-wave-right {
            0%,
            100% {
              transform: translate3d(var(--dd-edge-wobble, 0.55rem), -50%, 0) scaleX(0.84);
            }

            25% {
              transform: translate3d(calc(-1 * var(--dd-edge-wobble, 0.55rem) * 0.35), calc(-50% - 0.14rem), 0) scaleX(1.04);
            }

            50% {
              transform: translate3d(calc(-1 * var(--dd-edge-wobble, 0.55rem)), -50%, 0) scaleX(1.12);
            }

            75% {
              transform: translate3d(calc(var(--dd-edge-wobble, 0.55rem) * 0.38), calc(-50% + 0.12rem), 0) scaleX(0.94);
            }
          }

          @keyframes dd-dotdagene-gooey-source-wave {
            0%,
            100% {
              margin-top: calc(-1 * var(--bubble-wave-amplitude, 0.2rem));
            }

            50% {
              margin-top: var(--bubble-wave-amplitude, 0.2rem);
            }
          }

          @keyframes dd-dotdagene-gooey-edge-flow-right {
            0% {
              transform: translate3d(0, -50%, 0) scale(0.65);
              opacity: 0;
            }

            12% {
              transform: translate3d(calc(var(--bubble-distance, 2rem) * 0.16), -50%, 0) scale(0.95);
              opacity: 0.88;
            }

            70% {
              transform: translate3d(calc(var(--bubble-distance, 2rem) * 0.74), -50%, 0) scale(0.88);
              opacity: 0.82;
            }

            100% {
              transform: translate3d(var(--bubble-distance, 2rem), -50%, 0) scale(0.62);
              opacity: 0;
            }
          }

          @keyframes dd-dotdagene-gooey-edge-flow-left {
            0% {
              transform: translate3d(0, -50%, 0) scale(0.65);
              opacity: 0;
            }

            12% {
              transform: translate3d(calc(-1 * var(--bubble-distance, 2rem) * 0.16), -50%, 0) scale(0.95);
              opacity: 0.88;
            }

            70% {
              transform: translate3d(calc(-1 * var(--bubble-distance, 2rem) * 0.74), -50%, 0) scale(0.88);
              opacity: 0.82;
            }

            100% {
              transform: translate3d(calc(-1 * var(--bubble-distance, 2rem)), -50%, 0) scale(0.62);
              opacity: 0;
            }
          }

          @media (min-width: 640px) {
            .dd-dotdagene-header__logo {
              height: 2.5rem;
            }
          }

          @media (min-width: 768px) {
            .dd-dotdagene-header__grid {
              grid-template-columns: 1.45fr 0.9fr 1fr;
            }

            .dd-dotdagene-header__left {
              justify-content: flex-start;
              padding-left: 2.5rem;
            }

            .dd-dotdagene-header__middle {
              display: block;
            }

            .dd-dotdagene-header__right {
              justify-content: flex-end;
              padding-right: 3.8rem;
            }

            .dd-dotdagene-header__logo {
              height: 2.5rem;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .dd-dotdagene-header__edge-bubble {
              animation: none;
              opacity: 0.72;
            }

            .dd-dotdagene-header__edge-wave-node {
              animation: none;
            }
          }
        `}
      </style>

      <div className="dd-dotdagene-header__container">
        <svg className="dd-dotdagene-header__defs" aria-hidden="true" focusable="false">
          <defs>
            <filter id={gooeyFilterId} x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={resolvedTuning.blur} result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="blob"
              />
            </filter>
          </defs>
        </svg>

        <div className="dd-dotdagene-header__grid">
          <div className="dd-dotdagene-header__segment dd-dotdagene-header__left">
            {logoSrc ? (
              <img src={logoSrc} alt={logoAlt} className="dd-dotdagene-header__logo" />
            ) : (
              <span className="dd-dotdagene-header__logo-fallback">{logoFallbackText}</span>
            )}
            <div
              className="dd-dotdagene-header__edge dd-dotdagene-header__edge-left"
              style={edgeFilterStyle}
              aria-hidden="true"
            >
              <div className="dd-dotdagene-header__edge-wave">
                <span className="dd-dotdagene-header__edge-wave-base" />
                {yellowEdgeWaveNodes.map((node, index) => (
                  <span
                    key={`yellow-wave-${index}`}
                    className="dd-dotdagene-header__edge-wave-node"
                    style={edgeWaveNodeStyle(node)}
                  />
                ))}
              </div>
              {yellowEdgeBubbles.map((bubble, index) => (
                <span
                  key={`yellow-edge-${index}`}
                  className="dd-dotdagene-header__edge-bubble"
                  style={bubbleStyle(bubble)}
                />
              ))}
            </div>
          </div>

          <div className="dd-dotdagene-header__middle" />

          <div className="dd-dotdagene-header__segment dd-dotdagene-header__right">
            <p className="dd-dotdagene-header__date">{dateText}</p>
            <div
              className="dd-dotdagene-header__edge dd-dotdagene-header__edge-right"
              style={edgeFilterStyle}
              aria-hidden="true"
            >
              <div className="dd-dotdagene-header__edge-wave">
                <span className="dd-dotdagene-header__edge-wave-base" />
                {purpleEdgeWaveNodes.map((node, index) => (
                  <span
                    key={`purple-wave-${index}`}
                    className="dd-dotdagene-header__edge-wave-node"
                    style={edgeWaveNodeStyle(node)}
                  />
                ))}
              </div>
              {purpleEdgeBubbles.map((bubble, index) => (
                <span
                  key={`purple-edge-${index}`}
                  className="dd-dotdagene-header__edge-bubble"
                  style={bubbleStyle(bubble)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

export const DotdageneAdvert = ({ start, end }: Interval) => {
  if (!isWithinInterval(new Date(), { start, end })) {
    return null
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between items-center gap-2 text-[0.625rem] text-gray-400 dark:text-stone-600">
        <Text>
          Presentert av{" "}
          <Link className="inline-flex gap-0.5 items-center hover:underline" href="https://dotdagene.no">
            dotDAGENE <IconArrowUpRight className="size-2.5" />
          </Link>
        </Text>
        <div className="flex gap-1 items-center">
          <IconClock className="size-3" />
          <Text>{formatDistanceToNow(end, { locale: nb })}</Text>
        </div>
      </div>
      <DotdageneHeader logoSrc="./dotdagene-logo.svg" />
    </div>
  )
}
