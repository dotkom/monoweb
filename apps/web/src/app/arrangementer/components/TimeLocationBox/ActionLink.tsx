import { Icon, Text, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@dotkomonline/ui"
import clsx from "clsx"
import Link from "next/link.js"

interface Props {
  href: string
  label: string
}

export const ActionLink = ({ href, label }: Props) => (
  <TooltipProvider>
    <Tooltip delayDuration={150}>
      <TooltipTrigger>
        <Link
          className={clsx("border border-slate-3 hover:bg-slate-2 p-1.5 rounded-lg flex items-center")}
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          <Icon icon="tabler:arrow-up-right" className="text-2xl" />
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <Text>{label}</Text>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)
