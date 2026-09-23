"use client"

import { useGroupPermissions } from "@/app/(internal)/grupper/use-group-permissions"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Text,
  TextLink,
  Title,
} from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { differenceInHours, formatDate, formatDistanceToNowStrict } from "date-fns"
import { nb } from "date-fns/locale"
import { useState } from "react"
import { useEndGroupMembershipMutation, useStartGroupMembershipMutation } from "../../../mutations"
import { useGroupDetailsContext } from "../../provider"
import { GroupMemberWriteForm } from "../components/GroupMemberWriteForm"
import { GroupMembershipTable } from "./components/GroupMembershipTable"
import { useGroupMemberDetailsContext } from "./provider"

export default function GroupMemberDetailsPage() {
  const { groupMember } = useGroupMemberDetailsContext()
  const { group } = useGroupDetailsContext()
  const { canManageMembership } = useGroupPermissions()
  const [isEndMembershipOpen, setIsEndMembershipOpen] = useState(false)
  const [isNewMembershipOpen, setIsNewMembershipOpen] = useState(false)

  const startMembership = useStartGroupMembershipMutation()
  const endMembership = useEndGroupMembershipMutation()

  const activeMemberships = groupMember.groupMemberships.filter((membership) => membership.end === null)

  return (
    <div className="flex flex-col gap-4">
      {!canManageMembership && (
        <ReadOnlyNotice
          title="Du kan ikke redigere gruppemedlemskapet"
          message="Dette er fordi du ikke er leder eller nestleder av gruppen. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      <TextLink href={`/grupper/${group.slug}/medlemmer`}>Tilbake til medlemmer</TextLink>
      <Title element="h2" className="text-2xl">
        Oppdater gruppemedlemskap
      </Title>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span>Gruppe:</span>
          <TextLink href={`/grupper/${group.slug}`} className="inline-flex items-center gap-1.5">
            {group.imageUrl && (
              <span className="flex size-5 items-center justify-center overflow-hidden rounded-sm bg-white p-0.5">
                {/** biome-ignore lint/performance/noImgElement: next images aren't configured */}
                <img src={group.imageUrl} alt={getGroupDisplayName(group)} className="size-4 object-contain" />
              </span>
            )}
            {getGroupDisplayName(group)}
          </TextLink>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span>Bruker:</span>
          <TextLink href={`/brukere/${groupMember.id}`} className="inline-flex items-center gap-1.5">
            <Avatar className="size-6">
              {groupMember.imageUrl && <AvatarImage src={groupMember.imageUrl} />}
              <AvatarFallback>{groupMember.name?.at(0) ?? "?"}</AvatarFallback>
            </Avatar>
            {groupMember.name || "Ukjent bruker"}
          </TextLink>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-fit">
            Hvordan virker medlemskap og roller?
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-lg p-3">
          <div className="flex flex-col gap-2 text-sm">
            <Text>
              Vi lagrer ett medlemskap per sett med roller. Det betyr at ett medlem gjerne har flere medlemskaper, hvor
              hvert medlemskap kan ha flere roller.
            </Text>
            <Text>
              Dersom et medlem endrer roller, skal man avslutte nåværende medlemskap og opprette et nytt medlemskap med
              de nye rollene.
            </Text>
            <Text>
              Eksempel: Du starter som medlem, så blir du Vinstraffansvarlig, og senere blir du tillitsvalgt i tillegg
              til Vinstraffansvarlig, og til slutt er du bare medlem igjen.
              <br />
              Rollene dine ser sånn her ut: Medlem → Vinstraffansvarlig → Vinstraffansvarlig og tillitsvalgt → medlem
            </Text>
            <Text>
              Dersom noen har en rolle (f.eks. Vinstraffansvarlig), er det ikke nødvendig å føre opp &quot;Medlem&quot;
              (eller en ekvivalent generisk medlemsrolle).
            </Text>
          </div>
        </PopoverContent>
      </Popover>

      <Separator />

      {activeMemberships.length > 0 ? (
        <div className="flex flex-col gap-3">
          <Text>Aktivt medlemskap:</Text>
          <div className="flex flex-col gap-3 rounded-lg bg-muted/40 p-4">
            {activeMemberships.map((membership) => (
              <div key={membership.id} className="flex flex-col gap-1">
                <Title element="h3" className="text-lg font-semibold">
                  {membership.roles.map((role) => role.name).join(", ")}
                </Title>
                <Text>
                  {differenceInHours(new Date(), membership.start, { roundingMethod: "floor" }) < 1
                    ? "Under én time"
                    : formatDistanceToNowStrict(membership.start, { locale: nb })}{" "}
                  (siden {formatDate(membership.start, "dd. MMMM yyyy", { locale: nb })})
                </Text>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <PermissionTooltip allowed={canManageMembership} className="w-fit">
                <Button
                  variant="default"
                  className="w-fit"
                  disabled={!canManageMembership}
                  onClick={() => setIsNewMembershipOpen(true)}
                >
                  Avslutt nåværende og lag nytt medlemskap
                </Button>
              </PermissionTooltip>
              <PermissionTooltip allowed={canManageMembership} className="w-fit">
                <Button
                  variant="destructive"
                  className="w-fit"
                  disabled={!canManageMembership}
                  onClick={() => setIsEndMembershipOpen(true)}
                >
                  Avslutt gruppemedlemskapet
                </Button>
              </PermissionTooltip>
            </div>
          </div>
          <Separator />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Text className="text-xl">Ikke aktivt medlem</Text>
          <PermissionTooltip allowed={canManageMembership} className="w-fit">
            <Button
              variant="default"
              className="w-fit"
              disabled={!canManageMembership}
              onClick={() => setIsNewMembershipOpen(true)}
            >
              Legg til medlemskap
            </Button>
          </PermissionTooltip>
          <Separator />
        </div>
      )}

      <GroupMembershipTable groupMember={groupMember} disabled={!canManageMembership} />

      <AlertDialog open={isNewMembershipOpen} onOpenChange={setIsNewMembershipOpen}>
        <AlertDialogContent size="md" onOutsideClick={() => setIsNewMembershipOpen(false)}>
          <div className="flex flex-row items-center justify-between gap-4">
            <AlertDialogTitle>
              {activeMemberships.length ? "Avslutt nåværende og lag nytt medlemskap" : "Legg til medlemskap"}
            </AlertDialogTitle>
            <AlertDialogCancel type="button">
              <IconX className="size-5" />
            </AlertDialogCancel>
          </div>

          {isNewMembershipOpen && (
            <GroupMemberWriteForm
              groupId={group.slug}
              disabled={!canManageMembership}
              onSubmit={(data) => {
                startMembership.mutate({
                  userId: groupMember.id,
                  groupId: group.slug,
                  roleIds: data.roleIds,
                })
                setIsNewMembershipOpen(false)
              }}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmDeleteModal
        open={isEndMembershipOpen}
        onOpenChange={setIsEndMembershipOpen}
        title="Avslutt gruppemedlemskapet"
        confirmLabel="Avslutt gruppemedlemskapet"
        cancelLabel="Avbryt"
        description={`Er du sikker på at du vil avslutte gruppemedlemskapet for ${groupMember?.name}?`}
        onConfirm={() => {
          endMembership.mutate({ groupId: group.slug, userId: groupMember.id })
          setIsEndMembershipOpen(false)
        }}
      />
    </div>
  )
}
