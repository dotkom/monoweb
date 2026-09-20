"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { env } from "@/lib/env"
import { createAbsoluteEventPageUrl, getCurrentUTC } from "@dotkomonline/utils"
import {
  IconAlertTriangleFilled,
  IconBell,
  IconCalendarEvent,
  IconCreditCard,
  IconForms,
  IconListDetails,
  IconSelector,
  IconUser,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { type PropsWithChildren, use, useMemo } from "react"
import { useDeleteEventMutation } from "../mutations"
import { useEventFeedbackFormGetQuery, useEventWithAttendancesGetQuery } from "../queries"
import { EventContext } from "./provider"

function EventWarningBox({ content }: { content: string }) {
  return (
    <div className="mb-4 rounded-md bg-red-700 p-4">
      <div className="flex items-center gap-2">
        <IconAlertTriangleFilled className="size-6 shrink-0 text-white" />
        <p className="text-lg text-white">{content}</p>
      </div>
    </div>
  )
}

export default function EventWithAttendancesLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id: rawId } = use(params)
  const id = decodeURIComponent(rawId)
  const router = useRouter()
  const authorization = useAuthorization()
  const { data, isLoading, isError, error } = useEventWithAttendancesGetQuery(id)
  const { data: feedbackForm, isLoading: feedbackFormIsLoading } = useEventFeedbackFormGetQuery(id)

  const remove = useDeleteEventMutation()

  const hostingGroupIds = useMemo(
    () => data?.event.hostingGroups.map((group) => group.slug) ?? [],
    [data?.event.hostingGroups]
  )
  const canEdit = data ? authorization.canEditEvent(hostingGroupIds) : false

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/arrangementer"
        title="Feil ved henting av arrangement"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const { event, attendance } = data
  const hasAttendance = Boolean(attendance)
  const hasPools = Boolean(attendance?.pools && attendance.pools.length > 0)

  const now = getCurrentUTC()
  const hasFeedbackForm = Boolean(feedbackForm)
  const isCompanyEvent = event.type === "COMPANY"
  const hasEventEnded = event.end < now

  const basePath = `/arrangementer/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconListDetails,
    },
    {
      href: `${basePath}/pamelding`,
      label: "Påmelding",
      icon: IconCalendarEvent,
    },
    {
      href: `${basePath}/pameldte`,
      label: "Påmeldte",
      icon: IconUser,
      disabled: !hasAttendance,
    },
    {
      href: `${basePath}/varsler`,
      label: "Varsler",
      icon: IconBell,
      disabled: !hasAttendance,
    },
    {
      href: `${basePath}/valg`,
      label: "Valg",
      icon: IconSelector,
      disabled: !hasAttendance,
    },
    {
      href: `${basePath}/betaling`,
      label: "Betaling",
      icon: IconCreditCard,
      disabled: !hasAttendance,
    },
    {
      href: `${basePath}/tilbakemeldingsskjema`,
      label: "Tilbakemeldingsskjema",
      icon: IconForms,
      disabled: !hasAttendance,
    },
  ]

  return (
    <ResourceDetailLayout
      title={event.title}
      backHref="/arrangementer"
      navItems={navItems}
      viewInWebProps={{
        label: "Se arrangementet",
        href: createAbsoluteEventPageUrl(env.NEXT_PUBLIC_WEB_URL, event.id, event.title),
      }}
      onDelete={() => {
        remove.mutate(
          { id: event.id },
          {
            onSuccess: () => {
              router.replace("/arrangementer")
            },
          }
        )
      }}
      deleteConfirmTitle={`Er du sikker på at du vil slette ${event.title}?`}
      readOnlyNotice={
        canEdit
          ? undefined
          : {
              title: "Du kan ikke redigere arrangementet.",
              message: "Dette er fordi du ikke er arrangør. Kontakt dotkom dersom du mener dette er en feil.",
            }
      }
      missingDeletePermission={
        canEdit
          ? undefined
          : "Du har ikke redigeringstilgang til dette arrangementet. Kontakt dotkom dersom du mener dette er en feil."
      }
    >
      <EventContext.Provider value={data}>
        {hasAttendance && !hasPools && <EventWarningBox content="Påmeldingen har ingen påmeldingsgrupper" />}
        {!feedbackFormIsLoading && isCompanyEvent && !hasFeedbackForm && !hasEventEnded && (
          <EventWarningBox content="Arrangementet mangler tilbakemeldingsskjema. Det vil ikke være mulig å opprette tilbakemeldingsskjema etter arrangementet er over" />
        )}
        {children}
      </EventContext.Provider>
    </ResourceDetailLayout>
  )
}
