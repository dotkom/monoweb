import { Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@dotkomonline/ui"
import clsx from "clsx"
import Link from "next/link.js"
import { IconArrowUpRight } from "@tabler/icons-react"

interface Props {
  href: string
  label: string
}

export const ActionLink = ({ href, label }: Props) => (
  <TooltipProvider>
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
          <IconArrowUpRight className="w-6 h-6"/>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <Text>{label}</Text>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
