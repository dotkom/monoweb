import type { AuditLogTable } from "@dotkomonline/rpc/audit-log"

// NOTE: If a table shouldn't be linkable from an audit log,
// either if it doesn't have its own page, or if it can't be linked to using only the resource id,
// set the value to null.
export const auditLogTableMap = {
  event: {
    label: "Arrangement",
    path: "/admin/arrangementer",
  },
  group: {
    label: "Gruppe",
    path: "/admin/grupper",
  },
  ow_user: {
    label: "Bruker",
    path: "/admin/brukere",
  },
  job_listing: {
    label: "Karriere",
    path: "/admin/karriere",
  },
  mark: {
    label: "Prikker",
    path: "/admin/prikker",
  },
  personal_mark: null,
  offline: {
    label: "Offline",
    path: "/admin/offline",
  },
  contest: {
    label: "Konkurranse",
    path: "/admin/konkurranser",
  },
  notification: {
    label: "Notifikasjon",
    path: "/admin/varslinger",
  },
  fadderuke: {
    label: "Fadderukene",
    path: "/admin/fadderukene",
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
