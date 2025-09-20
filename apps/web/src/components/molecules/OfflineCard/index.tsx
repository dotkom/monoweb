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
          <div className="perspective-[1000px] bg-gray-300 rounded-r-md">
            <div
              className="
                transform-style-[preserve-3d]
                transition-transform duration-[600ms] ease-in-out
                origin-left hover:rotate-y-[-20deg]
                shadow-md
              "
            >
              <Image
                src="https://s3.eu-north-1.amazonaws.com/cdn.online.ntnu.no/%2F1755548141016-e7d24ab0-b81e-4b10-bce5-cd975420396f-offline.png"
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
