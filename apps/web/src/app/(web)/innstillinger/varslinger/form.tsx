"use client"

import {
  type NotificationDeliverySettings,
  NotificationDeliverySettingsSchema,
  type NotificationType,
  NotificationTypeSchema,
} from "@dotkomonline/rpc/notification"
import { Text, Title } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  IconAlertTriangle,
  IconArticle,
  IconBellRinging,
  IconBook2,
  IconBriefcase,
  IconCalendar,
  IconCalendarCheck,
  IconCalendarMinus,
  IconCalendarPlus,
  IconCheck,
  IconClipboardText,
  IconFlag,
  IconListNumbers,
  IconLoader,
  IconSpeakerphone,
  IconUsersGroup,
  type TablerIcon,
} from "@tabler/icons-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { NotificationSettingsRow } from "./notification-settings-row"

const NOTIFICATION_GROUPS = [
  { id: "EVENTS", title: "Arrangementene dine" },
  { id: "IMPORTANT", title: "Viktige beskjeder" },
  { id: "NEWS", title: "Nytt fra Online" },
] as const

const NOTIFICATION_PRESENTATION = {
  BROADCAST: { group: "NEWS", icon: IconSpeakerphone },
  BROADCAST_IMPORTANT: { group: "IMPORTANT", icon: IconSpeakerphone },
  EVENT_REMINDER: { group: "EVENTS", icon: IconBellRinging },
  EVENT_UPDATE: { group: "EVENTS", icon: IconCalendar },
  ATTENDANCE_REGISTRATION: { group: "EVENTS", icon: IconCalendarPlus },
  ATTENDANCE_DEREGISTRATION: { group: "EVENTS", icon: IconCalendarMinus },
  ATTENDANCE_REGISTRATION_FROM_QUEUE: { group: "EVENTS", icon: IconCalendarCheck },
  ATTENDANCE_QUEUE_UPDATE: { group: "EVENTS", icon: IconListNumbers },
  ATTENDANCE_COMPLETION_FAILED: { group: "EVENTS", icon: IconAlertTriangle },
  NEW_ARTICLE: { group: "NEWS", icon: IconArticle },
  NEW_INTEREST_GROUP: { group: "NEWS", icon: IconUsersGroup },
  NEW_JOB_LISTING: { group: "NEWS", icon: IconBriefcase },
  NEW_OFFLINE: { group: "NEWS", icon: IconBook2 },
  NEW_MARK: { group: "IMPORTANT", icon: IconFlag },
  NEW_FEEDBACK_FORM: { group: "EVENTS", icon: IconClipboardText },
} satisfies Record<
  Exclude<NotificationType, "JOB_LISTING_REMINDER" | "NEW_EVENT">,
  { group: (typeof NOTIFICATION_GROUPS)[number]["id"]; icon: TablerIcon }
>

const NOTIFICATION_GROUPS_WITH_TYPES = NOTIFICATION_GROUPS.map((group) => {
  const notificationTypes = NotificationTypeSchema.options
    .filter((notificationType): notificationType is keyof typeof NOTIFICATION_PRESENTATION => {
      return notificationType in NOTIFICATION_PRESENTATION
    })
    .filter((notificationType) => NOTIFICATION_PRESENTATION[notificationType].group === group.id)

  return { ...group, notificationTypes }
})

interface NotificationSettingsFormProps {
  settings: NotificationDeliverySettings
  onUpdate: (settings: NotificationDeliverySettings) => Promise<NotificationDeliverySettings>
  isSaving: boolean
  isSaveSuccessful: boolean
  saveError?: string
  resetSaveState: () => void
}

export function NotificationSettingsForm({
  settings,
  onUpdate,
  isSaving,
  isSaveSuccessful,
  saveError,
  resetSaveState,
}: NotificationSettingsFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<NotificationDeliverySettings>({
    defaultValues: settings,
    resolver: zodResolver(NotificationDeliverySettingsSchema),
  })

  const isUpdating = isSaving || isSubmitting

  useEffect(() => {
    if (isDirty) {
      return
    }

    reset(settings)
  }, [settings, isDirty, reset])

  const saveSettings = handleSubmit(async (values) => {
    try {
      const savedSettings = await onUpdate(values)

      reset(savedSettings)
    } catch {
      reset(settings)
    }
  })

  function handleSettingsChange() {
    resetSaveState()

    void saveSettings()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-7">
        {NOTIFICATION_GROUPS_WITH_TYPES.map((group) => {
          const groupTitleId = `notification-group-${group.id}`

          return (
            <section key={group.id} aria-labelledby={groupTitleId} className="flex flex-col gap-2">
              <Title id={groupTitleId} element="h2" size="sm" className="text-sm font-medium text-muted-foreground">
                {group.title}
              </Title>

              <div className="flex flex-col gap-0 rounded-xl divide-y divide-field-border/50 bg-muted/33 border border-field-border/50">
                {group.notificationTypes.map((notificationType) => (
                  <NotificationSettingsRow
                    key={notificationType}
                    notificationType={notificationType}
                    icon={NOTIFICATION_PRESENTATION[notificationType].icon}
                    control={control}
                    isUpdating={isUpdating}
                    errorMessage={errors[notificationType]?.isEnabled?.message}
                    onChange={handleSettingsChange}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        {isUpdating && (
          <div role="status" className="flex items-center gap-1 text-muted-foreground">
            <IconLoader className="size-4 animate-spin" />
            <Text className="text-sm">Lagrer…</Text>
          </div>
        )}
        {!isUpdating && isSaveSuccessful && (
          <div role="status" className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <IconCheck className="size-4" />
            <Text className="text-sm">Innstillingene er lagret.</Text>
          </div>
        )}
        {!isUpdating && saveError !== undefined && (
          <div role="alert" className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <IconAlertTriangle className="size-4" />
            <Text className="text-sm">Kunne ikke lagre innstillingene. Prøv igjen.</Text>
          </div>
        )}
      </div>
    </div>
  )
}
