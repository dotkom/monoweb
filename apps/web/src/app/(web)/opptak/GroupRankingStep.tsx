import type { CommitteeApplicationOpenPeriod } from "@dotkomonline/rpc/committee-application"
import {
  Button,
  Text,
  Title,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  RichText,
} from "@dotkomonline/ui"
import { GroupLogo } from "@/components/atoms/GroupLogo"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { IconChevronDown, IconChevronUp, IconCircles, IconDiamond } from "@tabler/icons-react"

interface GroupRankingStepProps {
  selectedExclusiveGroups: CommitteeApplicationOpenPeriod["groups"]
  selectedAdditiveGroups: CommitteeApplicationOpenPeriod["groups"]
  onMoveGroup: (groupId: string, direction: number) => void
}

export function GroupRankingStep({
  selectedExclusiveGroups,
  selectedAdditiveGroups,
  onMoveGroup,
}: GroupRankingStepProps) {
  const canReorder = selectedExclusiveGroups.length > 1

  return (
    <div className="flex flex-col gap-6">
      {selectedExclusiveGroups.length > 0 && (
        <section className="flex flex-col gap-3" aria-label="Enten-eller-grupper">
          <Text className="rounded-xl border border-border/60 bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
            {canReorder
              ? "Sett rekkefølgen du foretrekker. Du kan få tilbud om plass i hvilken som helst av disse gruppene, men bare bli tatt opp i én."
              : "Du har valgt én enten-eller-gruppe."}
          </Text>
          <Title element="h2" size="sm" className="flex items-center gap-2">
            <IconDiamond className="size-5 text-blue-600 dark:text-blue-300" aria-hidden="true" />
            Enten-eller
          </Title>
          <ol
            className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card"
            aria-label="Rekkefølge på grupper"
          >
            {selectedExclusiveGroups.map((group, groupIndex) => (
              <li key={group.id} className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
                <Text
                  element="span"
                  className="w-4 shrink-0 text-sm tabular-nums text-muted-foreground"
                  aria-hidden="true"
                >
                  {groupIndex + 1}.
                </Text>
                <div className="min-w-32 flex-1">
                  <GroupPreview group={group} />
                </div>
                {canReorder && (
                  <div className="ml-auto flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="size-12 rounded-lg p-0"
                      aria-label={`Flytt ${group.name} opp`}
                      disabled={groupIndex === 0}
                      onClick={() => {
                        onMoveGroup(group.id, -1)
                      }}
                    >
                      <IconChevronUp className="size-5" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="size-12 rounded-lg p-0"
                      aria-label={`Flytt ${group.name} ned`}
                      disabled={groupIndex === selectedExclusiveGroups.length - 1}
                      onClick={() => {
                        onMoveGroup(group.id, 1)
                      }}
                    >
                      <IconChevronDown className="size-5" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
      {selectedAdditiveGroups.length > 0 && (
        <section className="flex flex-col gap-2" aria-labelledby="unranked-groups-title">
          <Title element="h2" size="sm" id="unranked-groups-title" className="flex items-center gap-2">
            <IconCircles className="size-5 text-violet-600 dark:text-violet-300" aria-hidden="true" />
            Både-og
          </Title>
          <Text className="text-sm text-muted-foreground">
            Disse er også med i søknaden. Du kan bli tatt opp i flere av dem, også i tillegg til en enten-eller-gruppe.
            De trenger ingen rekkefølge.
          </Text>
          <ul className="flex flex-wrap gap-2" aria-label="Valgte både-og-grupper">
            {selectedAdditiveGroups.map((group) => (
              <li key={group.id} className="min-w-0 rounded-lg bg-muted/50 px-3 py-3">
                <GroupPreview group={group} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function GroupPreview({ group }: { group: CommitteeApplicationOpenPeriod["groups"][number] }) {
  const description = group.description.trim() || "Denne gruppen har ikke lagt til en beskrivelse ennå."

  return (
    <Dialog>
      <div className="flex items-center gap-2.5">
        {group.imageUrl !== null && group.imageUrl !== "" ? (
          <GroupLogo
            src={group.imageUrl}
            alt={group.name}
            width={40}
            height={40}
            className="size-full"
            containerClassName="size-10 rounded-full p-1"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted" aria-hidden="true">
            <OnlineIcon size={28} />
          </span>
        )}
        <div className="min-w-0">
          <Text className="break-words text-sm font-medium">{group.name}</Text>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="unstyled"
              className="min-h-6 cursor-pointer rounded-sm text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
          <DialogTitle>{group.name}</DialogTitle>
        </DialogHeader>
        <RichText content={description} />
        <DialogClose type="button" variant="outline">
          Lukk
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
