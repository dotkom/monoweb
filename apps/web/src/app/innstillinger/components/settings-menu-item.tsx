import { Button, cn, Text } from "@dotkomonline/ui"
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
  const isCurrent = path.startsWith(slug)

  return (
    <Button
      element={Link}
      href={slug}
      icon={<Icon className="shrink-0 size-5" />}
      variant="ghost"
      size="lg"
      className={cn(
        "justify-start px-3 -ml-3 py-2 rounded-md gap-2.5",
        isCurrent ? "text-foreground font-semibold" : "text-muted-foreground font-normal"
      )}
    >
      <Text element="span" className="text-base">
        {title}
      </Text>
    </Button>
  )
}
