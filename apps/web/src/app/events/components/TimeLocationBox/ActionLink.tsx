import { Icon, Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@dotkomonline/ui"
import clsx from "clsx"
import Link from "next/link.js"

interface Props {
  href: string
  iconHref: string
  label: string
}

export const ActionLink = ({ href, iconHref, label }: Props) => (
    <TooltipProvider>
  <Tooltip>
      <TooltipTrigger>
        <Link
          className={clsx("border border-slate-3 p-1.5 rounded-lg flex items-center")}
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          <Icon icon="tabler:arrow-up-right" width={24} height={24} />
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <Text>Test</Text>
      </TooltipContent>
  </Tooltip>
    </TooltipProvider>
)
