import { DropdownMenuItem, cn } from "@dotkomonline/ui"
import type { Icon } from "@tabler/icons-react"
import { IconChevronRight } from "@tabler/icons-react"
import Link from "next/link"
import type { FC } from "react"

interface MobileMenuCardProps {
  title: string
  href: string
  icon: Icon
  onClick?: () => void
}

export const MobileMenuCard: FC<MobileMenuCardProps> = ({ title, href, icon: IconComponent, onClick }) => {
  return (
    <DropdownMenuItem asChild className="flex-1 cursor-pointer p-0">
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "relative flex flex-col items-start justify-start w-full p-4 rounded-xl transition-colors",
          "bg-blue-100 hover:bg-blue-200 dark:bg-stone-700 dark:hover:bg-stone-600",
          "border border-blue-200 dark:border-stone-600"
        )}
      >
        <div className="flex w-full items-start justify-between mb-2">
          <IconComponent className="text-3xl text-gray-700 dark:text-stone-300" />
          <IconChevronRight className="text-xl opacity-70 text-gray-700 dark:text-stone-300" />
        </div>
        <span className="text-base font-medium text-gray-800 dark:text-stone-100">{title}</span>
      </Link>
    </DropdownMenuItem>
  )
}
