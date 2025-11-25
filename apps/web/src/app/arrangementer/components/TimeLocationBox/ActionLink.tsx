import { Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconArrowUpRight } from "@tabler/icons-react"
import clsx from "clsx"
import Link from "next/link.js"

interface Props {
  href: string
  label: string
}

export const ActionLink = ({ href, label }: Props) => (
  <Tooltip delayDuration={150}>
    <TooltipTrigger>
      <Link
        className={clsx(
          "border border-gray-200 hover:bg-gray-100 dark:border-stone-700 dark:hover:bg-stone-700 p-1.5 rounded-lg flex items-center"
        )}
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        <IconArrowUpRight className="size-6" />
      </Link>
    </TooltipTrigger>
    <TooltipContent>
      <Text>{label}</Text>
    </TooltipContent>
  </Tooltip>
)
