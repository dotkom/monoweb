import {
  getNotificationTypeLabel,
  type NotificationDelivery,
  type NotificationDeliverySettings,
  type NotificationType,
  REQUIRED_NOTIFICATION_TYPES,
} from "@dotkomonline/rpc/notification"
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Text,
} from "@dotkomonline/ui"
import { IconSelector, type TablerIcon } from "@tabler/icons-react"
import { type Control, Controller, useWatch } from "react-hook-form"

interface NotificationSettingsRowProps {
  notificationType: NotificationType
  icon: TablerIcon
  control: Control<NotificationDeliverySettings>
  isUpdating: boolean
  errorMessage?: string
  onChange: () => void
}

function getDeliverySummary(delivery: NotificationDelivery): string {
  if (!delivery.isEnabled) {
    return "Av"
  }

  const channels = []

  if (delivery.isEmailEnabled) {
    channels.push("E-post")
  }

  if (delivery.isPushEnabled) {
    channels.push("Push")
  }

  return channels.length === 0 ? "Stille" : channels.join(" + ")
}

export function NotificationSettingsRow({
  notificationType,
  icon: NotificationIcon,
  control,
  isUpdating,
  errorMessage,
  onChange,
}: NotificationSettingsRowProps) {
  const delivery = useWatch({ control, name: notificationType })
  const isRequired = REQUIRED_NOTIFICATION_TYPES.includes(notificationType)
  const titleId = `notification-${notificationType}`
  const notificationLabel = getNotificationTypeLabel(notificationType)
  const deliverySummary = getDeliverySummary(delivery)

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
        >
          <NotificationIcon className="size-4.5" />
        </span>

        <Text id={titleId} className="min-w-0 flex-1 wrap-anywhere text-sm sm:text-base">
          {notificationLabel}
        </Text>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUpdating}
              aria-label={`${notificationLabel}: ${deliverySummary}`}
              className="gap-1 font-normal text-sm text-muted-foreground pr-1 -mr-0.5"
            >
              {deliverySummary}

              <IconSelector className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel>{notificationLabel}</DropdownMenuLabel>

            <NotificationDeliveryCheckbox
              control={control}
              name={`${notificationType}.isEnabled`}
              label="Aktivert"
              isDisabled={isUpdating || isRequired}
              onChange={onChange}
            />

            {isRequired && (
              <DropdownMenuLabel className="max-w-64 whitespace-normal text-xs font-normal text-muted-foreground">
                Denne varslingen er alltid tilgjengelig på nettsiden.
              </DropdownMenuLabel>
            )}

            <DropdownMenuSeparator />

            <NotificationDeliveryCheckbox
              control={control}
              name={`${notificationType}.isEmailEnabled`}
              label="E-post"
              isDisabled={isUpdating || !delivery.isEnabled}
              onChange={onChange}
            />

            <NotificationDeliveryCheckbox
              control={control}
              name={`${notificationType}.isPushEnabled`}
              label="Push"
              isDisabled={isUpdating || !delivery.isEnabled}
              onChange={onChange}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {errorMessage !== undefined && (
        <Text className="pl-10 text-xs text-red-600 dark:text-red-400">{errorMessage}</Text>
      )}
    </div>
  )
}

interface NotificationDeliveryCheckboxProps {
  control: Control<NotificationDeliverySettings>
  name: `${NotificationType}.${keyof NotificationDelivery}`
  label: string
  isDisabled: boolean
  onChange: () => void
}

function NotificationDeliveryCheckbox({
  control,
  name,
  label,
  isDisabled,
  onChange,
}: NotificationDeliveryCheckboxProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <DropdownMenuCheckboxItem
          checked={field.value}
          disabled={isDisabled}
          closeOnClick={false}
          onCheckedChange={(isChecked) => {
            field.onChange(isChecked === true)
            onChange()
          }}
        >
          {label}
        </DropdownMenuCheckboxItem>
      )}
    />
  )
}
