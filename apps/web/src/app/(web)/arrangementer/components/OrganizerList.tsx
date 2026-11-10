"use client"

import type { Company } from "@dotkomonline/rpc/company"
import { type Group, createGroupPageUrl, getGroupDisplayName } from "@dotkomonline/rpc/group"
import { CollapsibleItemList } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"

interface OrganizerListProps {
  organizers: (Group | Company)[]
}

export function OrganizerList({ organizers }: OrganizerListProps) {
  const items = organizers.map((organizer) => {
    const isGroup = "type" in organizer

    const text = isGroup ? getGroupDisplayName(organizer) : organizer.name
    const href = isGroup ? createGroupPageUrl(organizer) : `/bedrifter/${organizer.slug}`
    const id = isGroup ? `group-${organizer.slug}` : `company-${organizer.id}`

    const hasImage = organizer.imageUrl !== null && organizer.imageUrl !== ""
    const icon = hasImage ? <Image key={id} src={organizer.imageUrl ?? ""} alt="" width={28} height={28} /> : null

    return { id, text, href, icon }
  })

  return <CollapsibleItemList items={items} label="Arrangører" emptyContent="Ingen arrangører" linkComponent={Link} />
}
