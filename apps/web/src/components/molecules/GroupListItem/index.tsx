import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { Text, Title } from "@dotkomonline/ui"
import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

export interface GroupListItemProps {
  image: string | null
  title: string
  description: string
  link: string
  isActive?: boolean
}

export const GroupListItem: FC<GroupListItemProps> = (props: GroupListItemProps) => (
  <div className="flex flex-col h-full p-4 py-8 text-center rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_14px_rgba(0,0,0,0.15)] transform transition duration-300 hover:scale-[1.03] animate-fadeIn sm:max-w-sm">
    {props.isActive === false && (
      <div className="absolute top-3 right-4 text-gray-700 text-sm font-semibold">Inaktiv</div>
    )}

    <div
      className={clsx(
        "relative mx-auto min-w-[150px] max-w-[200px] aspect-square bg-gray-100 p-2 rounded-full overflow-hidden",
        props.image && "shadow-lg",
        props.isActive === false && "opacity-80"
      )}
    >
      {props.image ? (
        <Image src={props.image} alt={props.title} fill className={clsx("object-contain")} />
      ) : (
        <OnlineIcon width={150} height={150} />
      )}
    </div>

    <Title element="h2" className="text-3xl mt-4 break-words font-normal">
      {props.title}
    </Title>
    <Text className="mt-2 mb-6 text-left px-3 line-clamp-4">{props.description}</Text>
    <Link className="mt-auto text-xl hover:underline" href={props.link}>
      Les mer
    </Link>
  </div>
)
