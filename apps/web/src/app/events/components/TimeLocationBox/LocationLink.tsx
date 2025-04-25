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

  if (link.includes("google") || link.includes("goo.gl")) {
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
        iconHref="https://i.imgur.com/pnBc6G2.png"
        label="Kart"
      />
    )
  }
  if (link.type === "mazemap") {
    return (
      <ActionLink
        href={link.href}
        iconHref="https://i.imgur.com/3wfhVXd.png"
        label="Mazemap"
      />
    )
  }
}
