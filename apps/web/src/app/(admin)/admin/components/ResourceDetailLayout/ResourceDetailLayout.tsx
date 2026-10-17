"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ConfirmDeleteModal } from "@admin/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { Button, cn, Title, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconArrowLeft, IconArrowUpRight, IconCheck, IconCopy, type TablerIcon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, type PropsWithChildren, type ReactNode, useEffect, useState } from "react"
import { PermissionTooltip } from "../PermissionTooltip"
import { ReadOnlyNotice } from "../ReadOnlyNotice"

export type ResourceDetailNavItem = {
  href: string
  label: string
  icon?: TablerIcon
  status?: ReactNode
  disabled?: boolean
  disabledReason?: string
  match?: "exact" | "prefix"
}

export type ViewInWebLinkProps = {
  label: string
  href: string
  prefetch?: boolean
  disabled?: boolean
}

export type ResourceDetailLayoutProps = PropsWithChildren<{
  title: string
  description?: ReactNode
  backHref: string
  navItems: ResourceDetailNavItem[]
  viewInWebProps?: ViewInWebLinkProps
  onDelete?: () => void
  actions?: ReactNode
  aside?: ReactNode
  deleteConfirmTitle?: string
  missingDeletePermission?: true | string
  deleteDisabledReason?: true | string
  className?: string
  readOnlyNotice?: {
    title: string
    message: string
  }
  copyIds: {
    value: string
    label?: string
  }[]
}>

function isNavItemActive(pathname: string, item: ResourceDetailNavItem): boolean {
  if (item.disabled) {
    return false
  }

  if (item.match === "prefix") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  return pathname === item.href
}

export function ResourceDetailLayout({
  title,
  description,
  backHref,
  navItems,
  viewInWebProps,
  onDelete,
  actions,
  aside,
  deleteConfirmTitle,
  missingDeletePermission,
  deleteDisabledReason,
  className,
  readOnlyNotice,
  copyIds,
  children,
}: ResourceDetailLayoutProps) {
  const router = useRouter()
  const rawPathname = usePathname()
  const { isAdministrator } = useAuthorization()
  const pathname = decodeURIComponent(rawPathname)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const header = (
    <>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          variant="outline"
          icon={<IconArrowLeft className="size-3.5" />}
          onClick={() => {
            router.push(backHref)
          }}
        >
          Tilbake
        </Button>
        {viewInWebProps && (
          <Button
            variant="outline"
            element={Link}
            href={viewInWebProps.href}
            prefetch={viewInWebProps.prefetch}
            target="_blank"
            rel="noopener noreferrer"
            iconRight={<IconArrowUpRight className="size-3.5" />}
            disabled={viewInWebProps.disabled}
          >
            {viewInWebProps.label}
          </Button>
        )}
        {copyIds.length > 0 &&
          isAdministrator &&
          copyIds.map((copyId) => (
            <CopyButton key={copyId.value} value={copyId.value} label={copyId.label ?? "Kopier ID"} />
          ))}
        {actions}
        {onDelete && (
          <>
            <ConfirmDeleteModal
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
              title={deleteConfirmTitle ?? `Er du sikker på at du vil slette ${title}?`}
              onConfirm={onDelete}
            />

            <DeleteButton
              onClick={() => setIsDeleteModalOpen(true)}
              missingDeletePermission={missingDeletePermission}
              deleteDisabledReason={deleteDisabledReason}
            />
          </>
        )}
      </div>

      <Title element="h1" className="mt-4 font-title text-3xl font-semibold tracking-tight">
        {title}
      </Title>
      {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}

      {readOnlyNotice && (
        <ReadOnlyNotice title={readOnlyNotice.title} message={readOnlyNotice.message} className="mt-4" />
      )}

      {navItems.length > 0 && (
        <nav
          className={cn("mt-4 flex overflow-x-auto", !aside && "shadow-[inset_0_-2px_0_0_var(--border)]")}
          aria-label="Seksjoner"
        >
          {navItems.map((item) => {
            const { href, label, icon: Icon, status, disabled, disabledReason } = item
            const active = isNavItemActive(pathname, item)

            const itemClassName = cn(
              "inline-flex items-center gap-1.5 border-b-2 border-transparent px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              "rounded-t hover:bg-muted",
              active ? "border-foreground text-foreground" : "hover:border-foreground/20"
            )

            if (disabled) {
              const disabledItem = (
                <span
                  className={cn(
                    itemClassName,
                    "cursor-not-allowed text-muted-foreground opacity-50 hover:bg-transparent"
                  )}
                >
                  {Icon && <Icon className="size-3.5 shrink-0" />}
                  {label}
                  {status}
                </span>
              )

              if (disabledReason === undefined) {
                return <Fragment key={href}>{disabledItem}</Fragment>
              }

              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>{disabledItem}</TooltipTrigger>
                  <TooltipContent>{disabledReason}</TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link key={href} href={href} scroll={false} className={itemClassName}>
                {Icon && <Icon className="size-3.5 shrink-0" />}
                {label}
                {status}
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )

  return (
    <div className={className}>
      {/* Cover the scroll container's padding so content stays hidden behind the sticky header. */}
      <div className="sticky -top-4 z-30 -mx-4 -mt-4 bg-background px-4 pt-4 md:-top-5.5 md:-mx-5.5 md:-mt-5.5 md:px-5.5 md:pt-5.5">
        {aside ? (
          <div className="flex gap-4 shadow-[inset_0_-2px_0_0_var(--border)]">
            <div className="flex min-w-0 flex-1 flex-col self-end">{header}</div>
            <div className="hidden shrink-0 self-stretch pb-4 md:pb-5.5 lg:block">{aside}</div>
          </div>
        ) : (
          header
        )}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}

interface DeleteButtonProps {
  onClick: () => void
  missingDeletePermission?: true | string
  deleteDisabledReason?: true | string
}

const DeleteButton = ({ onClick, missingDeletePermission, deleteDisabledReason }: DeleteButtonProps) => {
  const button = (
    <Button
      variant="destructive"
      disabled={missingDeletePermission != null || deleteDisabledReason != null}
      onClick={onClick}
    >
      Slett
    </Button>
  )

  if (missingDeletePermission != null) {
    return (
      <PermissionTooltip
        allowed={false}
        label={typeof missingDeletePermission === "string" ? missingDeletePermission : undefined}
      >
        {button}
      </PermissionTooltip>
    )
  }

  if (typeof deleteDisabledReason === "string") {
    return (
      <Tooltip>
        <TooltipTrigger>
          <span>{button}</span>
        </TooltipTrigger>
        <TooltipContent>{deleteDisabledReason}</TooltipContent>
      </Tooltip>
    )
  }

  return button
}

interface CopyButtonProps {
  value: string
  label?: string
  iconOnly?: boolean
  compact?: boolean
}

export const CopyButton = ({ value, label = "Kopier", iconOnly = false, compact = false }: CopyButtonProps) => {
  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    if (hasCopied) {
      const timeout = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timeout)
    }
  }, [hasCopied])

  const Icon = hasCopied ? IconCheck : IconCopy

  return (
    <Button
      variant={iconOnly || compact ? "ghost" : "outline"}
      size={iconOnly ? "icon-sm" : compact ? "xs" : undefined}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      icon={<Icon aria-hidden className={cn(iconOnly ? "size-4.5" : "size-3.5", hasCopied && "text-green-600")} />}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(
          () => {
            setHasCopied(true)
          },
          () => {
            setHasCopied(false)
          }
        )
      }}
    >
      {iconOnly ? undefined : label}
    </Button>
  )
}
