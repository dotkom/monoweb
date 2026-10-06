"use client"

import { GroupLogo } from "@/components/atoms/GroupLogo"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import type { CommitteeApplicationPeriodSummary } from "@dotkomonline/rpc/committee-application"
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
  Text,
  Title,
  cn,
} from "@dotkomonline/ui"
import { useId } from "react"

type ApplicationGroup = CommitteeApplicationPeriodSummary["groups"][number]

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
          "relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow sm:w-[calc(50%-0.375rem)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          checked ? "border-primary ring-1 ring-primary" : "border-border",
          !disabled && "hover:shadow-md"
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
          className={cn("absolute inset-0 rounded-lg", disabled ? "cursor-not-allowed" : "cursor-pointer")}
        >
          <Text element="span" className="sr-only">
            Velg {group.name}
          </Text>
        </Label>
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full border-2",
            checked ? "border-primary" : "border-input",
            disabled && "opacity-50"
          )}
        >
          {checked && <span className="size-2.5 rounded-full bg-primary" />}
        </span>

        <div className={cn("pointer-events-none flex flex-1 items-start gap-3 p-2 sm:p-3", disabled && "opacity-50")}>
          <GroupSelectionImage group={group} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Title element="h3" size="sm" id={titleId} className="break-words pr-7">
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
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="unstyled"
            className="relative flex min-h-10 w-full cursor-pointer items-center justify-center border-t border-border bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={`Les mer om ${group.name}`}
          >
            Les mer
          </Button>
        </DialogTrigger>
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
