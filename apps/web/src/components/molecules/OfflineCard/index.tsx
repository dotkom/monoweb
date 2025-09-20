import type { Offline } from "@dotkomonline/types"
import { Text, cn } from "@dotkomonline/ui"
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
          <div className="perspective-[1000px] bg-gray-300 rounded-r-md">
            <div
              className={cn(
                "transform-style-[preserve-3d] origin-left hover:rotate-y-[-20deg]",
                "transition-transform duration-[600ms] ease-in-out shadow-md",
              )}
            >
              <Image
                src={offline.imageUrl}
                width={200}
                height={250}
                alt={offline.title}
                className="w-auto shadow-lg rounded-r-md object-cover block backface-visibility-[hidden]"
              />
            </div>
          </div>
        </Link>
      )}
      <Text className="text-gray-950 dark:text-white">{offline.title}</Text>
    </div>
  )
}
