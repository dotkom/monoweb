"use client"

import { GroupLogo } from "@/components/atoms/GroupLogo"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import type { CommitteeApplicationOpenPeriod } from "@dotkomonline/rpc/committee-application"
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  RichText,
  Title,
  cn,
} from "@dotkomonline/ui"
import { IconCheck, IconPlus } from "@tabler/icons-react"
import { useId } from "react"

type ApplicationGroup = CommitteeApplicationOpenPeriod["groups"][number]

interface GroupSelectionCardProps {
  group: ApplicationGroup
  checked: boolean
  disabled?: boolean
  onSelectionChange: (groupId: string, checked: boolean) => void
}

export function GroupSelectionCard({ group, checked, disabled = false, onSelectionChange }: GroupSelectionCardProps) {
  const checkboxId = useId()
  const titleId = useId()
  const description = group.description.trim() || "Denne gruppen har ikke lagt til en beskrivelse ennå."

  return (
    <Dialog>
      <div
        className={cn(
          "relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm motion-safe:transition-[background-color,border-color,scale] motion-safe:duration-200 motion-safe:ease-out sm:w-[calc(50%-0.375rem)] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
          checked ? "border-blue-400 bg-blue-50/60 dark:border-blue-700 dark:bg-blue-950/30" : "border-border",
          !disabled && "motion-safe:has-[label:active]:scale-[0.98] motion-safe:has-[input:active]:scale-[0.98]",
          !disabled && !checked && "hover:border-blue-300 dark:hover:border-blue-700"
        )}
      >
        <input
          id={checkboxId}
          type="checkbox"
          name="applicationGroups"
          value={group.id}
          checked={checked}
          disabled={disabled}
          aria-labelledby={titleId}
          aria-describedby="group-selection-requirement"
          onChange={(event) => onSelectionChange(group.id, event.target.checked)}
          className="sr-only"
        />
        <Label
          htmlFor={checkboxId}
          className={cn(
            "flex flex-1 flex-col gap-4 p-4 text-left select-none",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          )}
        >
          <div className="pointer-events-none flex flex-1 items-start gap-3">
            <GroupSelectionImage group={group} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Title element="h3" size="sm" id={titleId} className="min-w-0 break-words">
                {group.name}
              </Title>
              <div inert>
                <RichText
                  content={description}
                  hideToggleButton
                  className="line-clamp-3 text-sm leading-5 [&_p:empty]:hidden [&_p]:my-0"
                />
              </div>
            </div>
          </div>
        </Label>
        <div className="grid grid-cols-2 items-stretch border-t border-border">
          <Label
            htmlFor={checkboxId}
            className={cn(
              "flex min-w-0 items-center justify-center px-3 py-3 select-none",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/50"
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                checked ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-6 items-center justify-center rounded-md border transition-colors",
                  checked
                    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                    : "border-input bg-background"
                )}
              >
                {checked ? <IconCheck className="size-4" /> : <IconPlus className="size-4" />}
              </span>
              {checked ? "Valgt" : "Velg gruppe"}
            </span>
          </Label>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="unstyled"
              className="relative flex min-h-12 min-w-0 cursor-pointer items-center justify-center border-l border-border bg-muted/50 px-3 py-3 text-sm font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              aria-label={`Les mer om ${group.name}`}
            >
              Les mer
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent
        size="xl"
        className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <div className="flex items-center gap-4">
            <GroupSelectionImage group={group} />
            <DialogTitle asChild>
              <Title element="h2" size="md" className="min-w-0 break-words">
                {group.name}
              </Title>
            </DialogTitle>
          </div>
        </DialogHeader>
        <RichText content={description} />
        <DialogClose type="button" variant="outline">
          Lukk
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

function GroupSelectionImage({ group }: { group: ApplicationGroup }) {
  if (group.imageUrl) {
    return (
      <GroupLogo
        src={group.imageUrl}
        alt={group.name}
        width={80}
        height={80}
        className="size-full"
        containerClassName="size-14 rounded-full p-1 sm:size-20 sm:p-2"
      />
    )
  }

  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted p-1 sm:size-20 sm:p-2">
      <OnlineIcon size={64} className="size-full" />
    </div>
  )
}
