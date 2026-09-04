"use client"

import { Button, Text, cn } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { Fragment, type ReactNode } from "react"

type FeideLinkNudgeHighlightProps = {
  show: boolean
  onDismiss: () => void
  children: ReactNode
}

export function FeideLinkNudgeHighlight({ show, onDismiss, children }: FeideLinkNudgeHighlightProps) {
  if (!show) {
    return <Fragment>{children}</Fragment>
  }

  return (
    <div
      className={cn(
        "relative col-span-2 grid grid-cols-[auto_auto] gap-y-3 gap-x-6 items-center rounded-xl border-2 border-red-500",
        "bg-red-50 p-4 dark:border-red-400 dark:bg-red-950/30"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Lukk FEIDE-påminnelsen"
        onClick={onDismiss}
        className="absolute top-2 right-2 size-8 p-0 text-muted-foreground hover:text-foreground"
      >
        <IconX className="size-4" />
      </Button>

      <Text className="col-span-2 pr-8 text-sm text-red-900 dark:text-red-100">
        Koble til FEIDE-kontoen din for enklere innlogging og automatisk medlemskap som student.
      </Text>

      {children}
    </div>
  )
}
