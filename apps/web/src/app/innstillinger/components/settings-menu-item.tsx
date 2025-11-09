import { Button, cn } from "@dotkomonline/ui"
import type { Icon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { FC } from "react"

export type SettingsMenuItemProps = {
  title: string
  slug: string
  icon: Icon
}

export const SettingsMenuItem: FC<SettingsMenuItemProps> = ({ title, slug, icon: Icon }) => {
  const path = usePathname()
  const isCurrent = path === slug

  return (
    <Button
      element={Link}
      href={slug}
      icon={<Icon width={20} height={20} />}
      variant="text"
      color="light"
      size="lg"
      className={cn(
        "justify-start px-3 -ml-3 py-2 rounded-md gap-2",
        isCurrent ? "bg-gray-50 dark:bg-stone-800 font-semibold" : "text-gray-700 dark:text-stone-200"
      )}
    >
      {title}
    </Button>
  )
}
