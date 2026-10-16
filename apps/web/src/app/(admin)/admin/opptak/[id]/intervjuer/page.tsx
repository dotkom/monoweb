"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { useAuthenticatedUser } from "@admin/lib/use-authenticated-user"
import { CommitteeTable } from "../../components/CommitteeTable"
import { NoAccessNotice } from "@admin/components/NoAccessNotice"
import { useApplicationPeriodGroupMatchingsQuery } from "../../queries"
import { Badge, type BadgeColor, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconArrowsShuffle, IconUser, type TablerIcon } from "@tabler/icons-react"
import { useMemo } from "react"
import { useApplicationContext } from "../provider"
import { createInterviewColumns, getInterviewHref, interviewTable } from "./[groupId]/components/InterviewTable"

const Stat = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: TablerIcon
  label: string
  value: string
  color: BadgeColor
}) => (
  <Tooltip>
    <TooltipTrigger className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-4 shrink-0" stroke={2} />
      <Badge color={color} variant="default" className="tabular-nums">
        {value}
      </Badge>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
)

export default function ApplicationInterviewsPage() {
  const { application } = useApplicationContext()
  const { groupMatchings, isLoading } = useApplicationPeriodGroupMatchingsQuery(application.id)
  const { isAdministrator, canViewApplicationMatching } = useAuthorization()
  const { dbUser } = useAuthenticatedUser()

  const getHref = useMemo(() => getInterviewHref(application.id), [application.id])

  const columns = useMemo(
    () => createInterviewColumns(isAdministrator ? null : (dbUser?.id ?? null)),
    [isAdministrator, dbUser]
  )

  if (application.interviewsPublishedAt === null && !isLoading) {
    return <NoAccessNotice />
  }

  const matched = groupMatchings.reduce((sum, group) => sum + group.matchedApplicants, 0)
  const total = groupMatchings.reduce((sum, group) => sum + group.totalApplicants, 0)
  const percentage = total === 0 ? 0 : Math.round((matched / total) * 100)
  const applicants = new Set(
    groupMatchings.flatMap((group) =>
      [...group.matchedInterviews, ...group.unmatchedApplicants].map((applicant) => applicant.applicationId)
    )
  ).size

  return (
    <CommitteeTable
      {...interviewTable}
      columns={columns}
      getHref={getHref}
      rows={groupMatchings}
      isLoading={isLoading}
      initialSorting={[{ id: isAdministrator ? "interviews" : "own", desc: true }]}
      actions={
        canViewApplicationMatching() &&
        matched > 0 && (
          <div className="mr-auto flex items-center gap-2 self-center">
            <Stat
              icon={IconUser}
              label="Totalt antall personer som har søkt komitée"
              value={`${applicants}`}
              color="gray"
            />
            <Stat
              icon={IconArrowsShuffle}
              label="Antall komitésøknader som har fått et intervju"
              value={`${matched} / ${total} (${percentage} %)`}
              color={percentage === 100 ? "green" : "red"}
            />
          </div>
        )
      }
    />
  )
}
