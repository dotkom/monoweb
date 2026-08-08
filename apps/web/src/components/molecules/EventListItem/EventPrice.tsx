import { Text, cn } from "@dotkomonline/ui"
import { IconCoins } from "@tabler/icons-react"
import type { FC } from "react"

interface EventPriceProps {
  price: number | null
  className?: string
}

export const EventPrice: FC<EventPriceProps> = ({ price, className }) => {
  if (price === null || price <= 0) {
    return null
  }

  return (
    <div className={cn("flex flex-row items-center gap-1.5 text-gray-800 dark:text-stone-400", className)}>
      <IconCoins className="size-4" />
      <Text className="text-xs md:text-sm">{price} kr</Text>
    </div>
  )
}
