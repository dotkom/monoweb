import { GroupLogo } from "@/components/atoms/GroupLogo"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import type { CommitteeApplicationOpenPeriod } from "@dotkomonline/rpc/committee-application"
import { Button, Text, cn } from "@dotkomonline/ui"
import { IconChevronDown, IconX } from "@tabler/icons-react"
import { useEffect, useRef } from "react"

interface SelectedGroupsMenuProps {
  selectedGroups: CommitteeApplicationOpenPeriod["groups"]
  onRemoveGroup: (groupId: string) => void
}

export function SelectedGroupsMenu({ selectedGroups, onRemoveGroup }: SelectedGroupsMenuProps) {
  const selectionSummary = useRef<HTMLElement>(null)
  const selectionDropdown = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const closeOnOutsidePress = (event: PointerEvent) => {
      const dropdown = selectionDropdown.current

      if (dropdown !== null && event.target instanceof Node && !dropdown.contains(event.target)) {
        dropdown.open = false
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      const dropdown = selectionDropdown.current

      if (event.key === "Escape" && dropdown !== null && dropdown.open) {
        dropdown.open = false
        selectionSummary.current?.focus()
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress)
    document.addEventListener("keydown", closeOnEscape)

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  return (
    <details ref={selectionDropdown} className="group/selection relative shrink-0">
      <summary
        ref={selectionSummary}
        className={cn(
          "flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden",
          selectedGroups.length > 0
            ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 group-open/selection:bg-emerald-500/20 dark:text-emerald-300"
            : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground group-open/selection:bg-muted group-open/selection:text-foreground"
        )}
      >
        <span id="group-selection-requirement" className="tabular-nums" aria-live="polite">
          {selectedGroups.length === 0 ? "Velg minst én" : `${selectedGroups.length} valgt`}
        </span>
        <IconChevronDown
          className="size-3.5 opacity-70 group-open/selection:rotate-180 motion-safe:transition-transform"
          aria-hidden="true"
        />
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 max-h-[50dvh] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-border/50 bg-popover p-2 text-popover-foreground shadow-xl shadow-black/10">
        <Text className="px-2 py-2 text-xs font-medium text-muted-foreground">Dine valg</Text>
        {selectedGroups.length === 0 ? (
          <Text className="px-2 pb-2 text-sm text-muted-foreground">Velg en komité eller gruppe fra listen.</Text>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedGroups.map((group) => (
              <li key={group.id}>
                <Button
                  type="button"
                  variant="unstyled"
                  aria-label={`Fjern ${group.name}`}
                  className="group/remove flex min-h-12 w-full items-center gap-3 rounded-xl border border-border/50 bg-muted/50 px-2 py-2 text-left text-sm transition-colors hover:border-border hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() => {
                    onRemoveGroup(group.id)
                    selectionSummary.current?.focus()
                  }}
                >
                  {group.imageUrl !== null && group.imageUrl !== "" ? (
                    <GroupLogo
                      src={group.imageUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="size-full"
                      containerClassName="size-9 rounded-lg p-1"
                    />
                  ) : (
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background"
                      aria-hidden="true"
                    >
                      <OnlineIcon size={24} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 break-words">{group.name}</span>
                  <IconX
                    className="size-4 shrink-0 text-muted-foreground/60 transition-colors group-hover/remove:text-foreground"
                    aria-hidden="true"
                  />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}
