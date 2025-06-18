import type { Offline } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"

interface OfflineCardProps {
  offline: Offline
}

export const OfflineCard = ({ offline }: OfflineCardProps) => {
  return (
    <div className="flex flex-col gap-3 text-wrap max-w-56">
      {offline.imageUrl && offline.fileUrl && (
        <Link href={offline.fileUrl}>
          <Image
            src={offline.imageUrl}
            width={200}
            height={250}
            alt={offline.title}
            className="rounded cursor-pointer w-auto transition-transform duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          />
        </Link>
      )}
      <Text className="text-slate-11 dark:text-white">{offline.title}</Text>
    </div>
  )
}
