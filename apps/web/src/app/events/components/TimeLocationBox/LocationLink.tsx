import type { FC } from "react"
import { ActionLink } from "./ActionLink"

export const getLinkType = (link: string | null): { type: "google-maps" | "mazemap"; href: string } | null => {
  if (link === null) return null

  if (link.includes("mazemap")) {
    return {
      type: "mazemap",
      href: link,
    }
  }

  if (link.includes("google")) {
    return {
      type: "google-maps",
      href: link,
    }
  }

  return null
}

type LocationLinkProps = {
  link: string | null
}
export const LocationLink: FC<LocationLinkProps> = ({ link: _link }) => {
  const link = getLinkType(_link)
  if (!link) return null

  if (link.type === "google-maps") {
    return (
      <ActionLink
        href={link.href}
        iconHref="https://s3.eu-north-1.amazonaws.com/cdn.staging.online.ntnu.no/google_maps.png"
        label="Kart"
        className="w-28 h-12"
      />
    )
  }
  if (link.type === "mazemap") {
    return (
      <ActionLink
        href={link.href}
        iconHref="https://s3.eu-north-1.amazonaws.com/cdn.staging.online.ntnu.no/60018c08c5bbb7e94657a8b2_M-06.png"
        label="Mazemap"
        className="w-28 h-12"
      />
    )
  }
}
