import type { FC } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/Avatar"
import { cn } from "../../utils"

export interface AvatarGroupProps {
  avatarUrls: string[]
  maxAvatars?: number
  displayRestAsNumber?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

export const AvatarGroup: FC<AvatarGroupProps> = ({
  avatarUrls,
  maxAvatars = 3,
  displayRestAsNumber = true,
  size = "md",
}) => {
  if (avatarUrls.length > maxAvatars) maxAvatars += 1
  const visibleAvatars = avatarUrls.slice(0, maxAvatars)
  const restAvatarsCount = avatarUrls.length - maxAvatars + 1

  let clazz: string
  switch (size) {
    case "sm":
      clazz = restAvatarsCount >= 100 ? "w-6 h-6 text-[0.7rem]" : "w-6 h-6 text-xs"
      break
    case "md":
      clazz = restAvatarsCount >= 100 ? "w-8 h-8 text-xs" : "w-8 h-8 text-sm"
      break
    case "lg":
      clazz = restAvatarsCount >= 100 ? "w-10 h-10 text-sm" : "w-10 h-10"
      break
    case "xl":
      clazz = "w-12 text-lg"
      break
  }

  return (
    <div className="flex flex-row">
      {visibleAvatars.map((avatarUrl, index) => (
        <Avatar
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={avatarUrl + index}
          className={cn("ring-2 ring-slate-12 -mr-1.5", clazz)}
        >
          <AvatarImage src={avatarUrl} alt={`#${index}`} />
          <AvatarFallback>#{index}</AvatarFallback>
          {displayRestAsNumber && index === maxAvatars - 1 && avatarUrls.length > maxAvatars && (
            <div className="w-full h-full absolute z-10 flex items-center justify-center">
              <div className="absolute w-full h-full opacity-70 bg-slate-12" />
              <span className="text-slate-1 z-20">+{avatarUrls.length - maxAvatars + 1}</span>
            </div>
          )}
        </Avatar>
      ))}
    </div>
  )
}
