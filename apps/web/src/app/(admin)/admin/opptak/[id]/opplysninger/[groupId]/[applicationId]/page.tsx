"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { useGroupAbbreviationMap } from "@admin/grupper/queries"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { useApplicantDetailsQuery } from "../../../../queries"
import { CopyButton } from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { EmptyCell, formatInterval, InterviewAttendees, InterviewLocation } from "../../../../components/Cells"
import type { CommitteeApplicationApplicantDetails } from "@dotkomonline/rpc/committee-application"
import { Badge, Text, Title } from "@dotkomonline/ui"
import {
  IconCalendarClock,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSchool,
  IconUsers,
  IconUsersGroup,
  IconUserSquareRounded,
  type IconProps,
} from "@tabler/icons-react"
import { useParams } from "next/navigation"
import type { ComponentType, ReactNode } from "react"

interface FieldProps {
  icon: ComponentType<IconProps>
  label: string
  children: ReactNode
}

const Field = ({ icon: FieldIcon, label, children }: FieldProps) => (
  <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
    <div className="flex w-44 shrink-0 items-center gap-1.5">
      <FieldIcon className="size-3.5 shrink-0 opacity-45" stroke={2} />
      <Text element="span" className="text-sm text-muted-foreground">
        {label}
      </Text>
    </div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
)

interface SectionProps {
  icon: ComponentType<IconProps>
  title: string
  children: ReactNode
}

const Section = ({ icon: SectionIcon, title, children }: SectionProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-1.5">
      <SectionIcon className="size-4 shrink-0 opacity-45" stroke={2} />
      <Title element="h3" className="text-sm font-semibold">
        {title}
      </Title>
    </div>
    {children}
  </div>
)

const Panel = ({ icon: PanelIcon, title, children }: SectionProps) => (
  <section className="flex flex-col gap-5 rounded-xl border border-input p-5">
    <div className="flex items-center gap-2">
      <PanelIcon className="size-5 shrink-0 opacity-45" stroke={2} />
      <Title element="h3" className="text-lg">
        {title}
      </Title>
    </div>
    {children}
  </section>
)

interface CopyableValueProps {
  value: string | null
  emptyLabel: string
}

const CopyableValue = ({ value, emptyLabel }: CopyableValueProps) => {
  if (value === null) {
    return <EmptyCell>{emptyLabel}</EmptyCell>
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Text className="min-w-0 truncate text-sm">{value}</Text>
      <CopyButton value={value} iconOnly />
    </div>
  )
}

type ApplicantInterview = NonNullable<CommitteeApplicationApplicantDetails["groupSelections"][number]["interview"]>

const InterviewDetails = ({ interview }: { interview: ApplicantInterview }) => (
  <div className="flex flex-col gap-2">
    <InterviewLocation interview={interview} />
    <Field icon={IconUsers} label="Deltagere">
      <InterviewAttendees attendees={interview.attendees} emptyLabel="Ingen deltar i intervjuet" />
    </Field>
  </div>
)

export default function ApplicantDetailsPage() {
  const { id, groupId, applicationId } = useParams<{ id: string; groupId: string; applicationId: string }>()
  const { data: applicant, isLoading } = useApplicantDetailsQuery(applicationId)
  const { abbreviationBySlug } = useGroupAbbreviationMap()
  const { isAdministrator, isApplicationGroupMember } = useAuthorization()

  const groupSelection = applicant?.groupSelections.find((selection) => selection.applicationGroupId === groupId)
  const committeeName =
    groupSelection === undefined ? null : (abbreviationBySlug.get(groupSelection.groupId) ?? groupSelection.groupId)

  useBreadcrumbLabel(breadcrumbPath("opptak", id, "opplysninger", groupId), committeeName)
  useBreadcrumbLabel(
    breadcrumbPath("opptak", id, "opplysninger", groupId, applicationId),
    applicant?.name ?? null,
    breadcrumbPath("opptak", id, "opplysninger", groupId)
  )

  if (isLoading || applicant === undefined) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <Title element="h2" className="text-2xl">
        {applicant.name}
      </Title>

      <Panel icon={IconUserSquareRounded} title="Informasjon">
        <div className="flex flex-col gap-2">
          <Field icon={IconMail} label="E-post">
            <CopyableValue value={applicant.email} emptyLabel="Ingen e-post" />
          </Field>
          <Field icon={IconPhone} label="Telefonnummer">
            <CopyableValue value={applicant.phone} emptyLabel="Ingen telefonnummer" />
          </Field>
          <Field icon={IconSchool} label="Klassetrinn">
            {applicant.studyYear === null ? (
              <EmptyCell>Ukjent</EmptyCell>
            ) : (
              <Text className="text-sm">{applicant.studyYear}. klasse</Text>
            )}
          </Field>
        </div>

        <Section icon={IconUserSquareRounded} title="Om søkeren">
          <Text className="whitespace-pre-wrap text-sm text-muted-foreground">{applicant.aboutMe}</Text>
        </Section>

        {isAdministrator && (
          <Section icon={IconUsersGroup} title="Komitéer søkeren har søkt på">
            <div className="flex flex-col gap-2">
              {applicant.groupSelections.map((selection) => (
                <div
                  key={selection.applicationGroupId}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-input px-4 py-3"
                >
                  <Badge color="gray" variant="default" className="tabular-nums">
                    {selection.rank}. valg
                  </Badge>
                  <Text element="span" className="text-sm font-medium">
                    {abbreviationBySlug.get(selection.groupId) ?? selection.groupId}
                  </Text>

                  {selection.interview === null ? (
                    <EmptyCell>Ingen intervju satt opp</EmptyCell>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <IconCalendarClock className="size-3.5 shrink-0 opacity-45" stroke={2} />
                        {formatInterval(selection.interview)}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <IconMapPin className="size-3.5 shrink-0 opacity-45" stroke={2} />
                        {selection.interview.locationName}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </Panel>

      {groupSelection !== undefined && !isAdministrator && isApplicationGroupMember(groupSelection.groupId) && (
        <Panel icon={IconCalendarClock} title="Intervju">
          {groupSelection.interview === null ? (
            <EmptyCell>Ingen intervju satt opp</EmptyCell>
          ) : (
            <InterviewDetails interview={groupSelection.interview} />
          )}
        </Panel>
      )}
    </div>
  )
}
