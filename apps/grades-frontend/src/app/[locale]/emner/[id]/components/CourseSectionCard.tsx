import { cn } from "@dotkomonline/ui"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@dotkomonline/ui/components/card"
import type { ReactNode } from "react"

type Props = {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}
export function CourseSectionCard({ title, action, children, className }: Props) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-4 sm:gap-6 rounded-lg p-0 border border-neutral-200 dark:bg-stone-800 dark:border-stone-700 ring-0",
        className
      )}
    >
      <CardHeader className="flex min-h-11 sm:min-h-14 flex-row items-center border-b border-neutral-200 dark:border-stone-700 pl-4 pr-1.5 sm:pl-6 sm:pr-3 py-0!">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {action && <CardAction className="self-center ml-auto">{action}</CardAction>}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-visible px-4 sm:px-6 pb-6">{children}</CardContent>
    </Card>
  )
}
