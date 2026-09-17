"use client"

import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { Button, cn, Title } from "@dotkomonline/ui"
import { IconArrowLeft, IconArrowUpRight, IconTrash, type TablerIcon } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { type PropsWithChildren, useState } from "react"

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
}

export type ResourceDetailLayoutProps = PropsWithChildren<{
  title?: string
  backHref: string
  navItems: ResourceDetailNavItem[]
  isLoading?: boolean
  isError?: boolean
  viewInWebProps?: ViewInWebLinkProps
  onDelete?: () => void
  deleteConfirmTitle?: string
  canDelete?: boolean
  className?: string
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
  isLoading,
  isError,
  title,
  backHref,
  navItems,
  viewInWebProps,
  onDelete,
  deleteConfirmTitle,
  canDelete = true,
  className,
  children,
}: ResourceDetailLayoutProps) {
  const router = useRouter()
  const rawPathname = usePathname()
  const pathname = decodeURIComponent(rawPathname)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="sticky top-0 z-30 -mx-4 bg-background px-4 dark:bg-background sm:-mx-6 sm:px-6">
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

              <Button
                variant="destructive"
                disabled={!canDelete}
                icon={<IconTrash className="size-3.5" />}
                onClick={() => {
                  setIsDeleteModalOpen(true)
                }}
              >
                Slett
              </Button>
            </>
          )}
        </div>

        {(isLoading || title === undefined) && !isError ? (
          <div className="mt-4 h-8 w-1/3 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
        ) : (
          <Title className="mt-4 font-title text-2xl font-semibold tracking-tight">
            {isError ? "Feil ved henting av ressurs" : title}
          </Title>
        )}

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
      </div>

      <div className="mt-6">{children}</div>
    </div>
  )
}
