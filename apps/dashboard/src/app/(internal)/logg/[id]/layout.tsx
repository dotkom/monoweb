"use client"

import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import type { AuditLogTable } from "@dotkomonline/rpc/audit-log"
import { Text, TextLink } from "@dotkomonline/ui"
import { IconAlignJustified, IconPlusMinus } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { useParams } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useAuditLogGetByIdQuery } from "../queries"
import { AuditLogDetailsContext } from "./provider"

// NOTE: If a table shouldn't be linkable from an audit log,
// either if it doesn't have its own page, or if it can't be linked to using only the resource id,
// set the value to null.
const tableMap = {
  event: {
    label: "Arrangement",
    path: "/arrangementer",
  },
  group: {
    label: "Gruppe",
    path: "/grupper",
  },
  ow_user: {
    label: "Bruker",
    path: "/brukere",
  },
  job_listing: {
    label: "Karriere",
    path: "/karriere",
  },
  mark: {
    label: "Prikker",
    path: "/prikker",
  },
  personal_mark: null,
  offline: {
    label: "Offline",
    path: "/offline",
  },
  contest: {
    label: "Konkurranse",
    path: "/konkurranser",
  },
  notification: {
    label: "Notifikasjon",
    path: "/notifikasjoner",
  },
  fadderuke: {
    label: "Fadderukene",
    path: "/fadderukene",
  },
  contestant: null,
  contest_team: null,
  attendance_pool: null,
  event_hosting_group: null,
  feedback_answer_option_link: null,
  feedback_form: null,
  feedback_form_answer: null,
  feedback_question: null,
  feedback_question_answer: null,
  feedback_question_option: null,
  group_membership: null,
  group_membership_role: null,
  article: null,
  attendee: null,
  company: null,
  group_role: null,
  job_listing_location: null,
  membership: null,
  notification_permissions: null,
  privacy_permissions: null,
  mark_group: null,
  article_tag: null,
  article_tag_link: null,
  attendance: null,
  deregister_reason: null,
  event_company: null,
} as const satisfies Record<AuditLogTable, { label: string; path: string } | null>

export default function AuditLogDetailsLayout({ children }: PropsWithChildren) {
  const { id: rawId } = useParams<{ id: string }>()
  const id = decodeURIComponent(rawId)
  const { data, isLoading, isError, error } = useAuditLogGetByIdQuery(id)

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/logg"
        title="Feil ved henting av hendelse"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/logg/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Json",
      icon: IconAlignJustified,
    },
    {
      href: `${basePath}/endringer`,
      label: "Endringer",
      icon: IconPlusMinus,
    },
  ]

  const tableLink = data.tableName in tableMap ? tableMap[data.tableName as AuditLogTable] : null

  return (
    <ResourceDetailLayout
      title="Hendelse"
      backHref="/logg"
      navItems={navItems}
      description={
        <div className="flex flex-col gap-2">
          <Text size="sm">
            Utført av {data.user?.name ? data.user.name : "System"}{" "}
            {formatDate(new Date(data.createdAt), "dd.MM.yyyy HH:mm")}
          </Text>

          {tableLink && (
            <Text size="sm">
              Gå til endret {tableLink.label} <TextLink href={`${tableLink.path}/${data.rowId}`}>her</TextLink>
            </Text>
          )}
        </div>
      }
    >
      <AuditLogDetailsContext.Provider value={{ auditLog: data }}>{children}</AuditLogDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
