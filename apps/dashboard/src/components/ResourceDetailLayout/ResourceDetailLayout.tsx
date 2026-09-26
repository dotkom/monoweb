"use client"

import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { Button, cn, Title, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconArrowLeft, IconArrowUpRight, type TablerIcon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { type PropsWithChildren, type ReactNode, useState } from "react"
import { PermissionTooltip } from "../PermissionTooltip"
import { ReadOnlyNotice } from "../ReadOnlyNotice"

export type ResourceDetailNavItem = {
  href: string
  label: string
  icon: TablerIcon
  disabled?: boolean
  match?: "exact" | "prefix"
}

export type ViewInWebLinkProps = {
  label: string
  href: string
  disabled?: boolean
}

export type ResourceDetailLayoutProps = PropsWithChildren<{
  title: string
  description?: ReactNode
  backHref: string
  navItems: ResourceDetailNavItem[]
  viewInWebProps?: ViewInWebLinkProps
  onDelete?: () => void
  deleteConfirmTitle?: string
  missingDeletePermission?: true | string
  deleteDisabledReason?: true | string
  className?: string
  readOnlyNotice?: {
    title: string
    message: string
  }
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
  deleteConfirmTitle,
  missingDeletePermission,
  deleteDisabledReason,
  className,
  readOnlyNotice,
  children,
}: ResourceDetailLayoutProps) {
  const router = useRouter()
  const rawPathname = usePathname()
  const pathname = decodeURIComponent(rawPathname)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="top-0 z-30 -mx-4 bg-background px-4 dark:bg-background">
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
              target="_blank"
              rel="noopener noreferrer"
              iconRight={<IconArrowUpRight className="size-3.5" />}
              disabled={viewInWebProps.disabled}
            >
              {viewInWebProps.label}
            </Button>
          )}

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
          <nav className="mt-4 flex overflow-x-auto shadow-[inset_0_-2px_0_0_var(--border)]" aria-label="Seksjoner">
            {navItems.map((item) => {
              const { href, label, icon: Icon, disabled } = item
              const active = isNavItemActive(pathname, item)

              const itemClassName = cn(
                "inline-flex items-center gap-1.5 border-b-2 border-transparent px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                "rounded-t hover:bg-muted",
                active ? "border-foreground text-foreground" : "hover:border-foreground/20"
              )

              if (disabled) {
                return (
                  <span
                    key={href}
                    className={cn(
                      itemClassName,
                      "cursor-not-allowed text-muted-foreground opacity-50 hover:bg-transparent"
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    {label}
                  </span>
                )
              }

              return (
                <Link key={href} href={href} scroll={false} className={itemClassName}>
                  <Icon className="size-3.5 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
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
