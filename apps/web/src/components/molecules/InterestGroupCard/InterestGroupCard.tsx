import type { InterestGroup } from "@dotkomonline/types"
import { AvatarGroup, Badge, Icon } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

interface InterestGroupProps {
  data: InterestGroup
}

export const InterestGroupCard: FC<InterestGroupProps> = ({ data }) => {
  const avatarUrls = Array.from({ length: 10 }, (_, i) => `https://i.pravatar.cc/150?img=${i}`)

  return (
    <div className="h-[22rem] w-72 shadow-xl flex flex-col rounded-2xl overflow-hidden">
      <div className="relative h-40 w-full bg-slate-11 shrink-0">
        <Image
          src={data.image ?? ""}
          alt="Interest group image"
          fill
          style={{ objectFit: "cover", mixBlendMode: "multiply" }}
        />
        <Badge
          className="absolute top-3 left-3 text-slate-1 text-sm"
          color={data.isActive ? "green" : "amber"}
          variant="solid"
        >
          {data.isActive ? "Aktiv" : "Inaktiv"}
        </Badge>
        {data.link && (
          <Link className="absolute bottom-3 right-3 flex" href={data.link}>
            <Icon icon="logos:slack-icon" height={23} width={23} />
          </Link>
        )}
      </div>
      <div className="pt-2 pb-3 px-4 h-full flex flex-col">
        <h3 className="font-semibold line-clamp-1" title={data.name}>
          {data.name}
        </h3>
        <p className="text-sm line-clamp-5">{data.description}</p>
        <div className="mt-auto flex flex-row justify-between items-center">
          <AvatarGroup avatarUrls={avatarUrls} maxAvatars={3} size="sm" />
          <Link href={`/interest-groups/${data.id}`} className="ml-auto hover:text-slate-12">
            Les mer »
          </Link>
        </div>
      </div>
    </div>
  )
}
