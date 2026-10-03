"use client"

import type { AuditLog, AuditLogTable } from "@dotkomonline/rpc/audit-log"
import {
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TextLink,
} from "@dotkomonline/ui"
import { IconAlignJustified, IconPlusMinus, IconX } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { useEffect, useState } from "react"
import { auditLogTableMap } from "./audit-log-table-map"
import { AuditLogDetails } from "./AuditLogDetails"

interface Props {
  auditLog: AuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenChangeComplete: (open: boolean) => void
}

const tabClassName = (active: boolean) =>
  cn(
    "inline-flex items-center gap-1.5 border-b-2 border-transparent px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
    "rounded-t hover:bg-muted",
    active ? "border-foreground text-foreground" : "hover:border-foreground/20"
  )

export function AuditLogModal({ auditLog, open, onOpenChange, onOpenChangeComplete }: Props) {
  const [tab, setTab] = useState("json")

  // biome-ignore lint/correctness/useExhaustiveDependencies: tab should reset when auditLog changes
  useEffect(() => {
    setTab("json")
  }, [auditLog?.id])

  if (auditLog === null) {
    return null
  }

  const tableLink =
    auditLog.tableName in auditLogTableMap ? auditLogTableMap[auditLog.tableName as AuditLogTable] : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
      <DialogContent size="lg" className="flex h-[min(85vh,40rem)] flex-col overflow-hidden">
        <DialogClose className="absolute top-4 right-4">
          <IconX className="size-5" />
          <span className="sr-only">Lukk</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Hendelse</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            <span>
              Utført av {auditLog.user?.name ? auditLog.user.name : "System"}{" "}
              {formatDate(new Date(auditLog.createdAt), "dd.MM.yyyy HH:mm")}
            </span>

            {tableLink && (
              <TextLink href={`${tableLink.path}/${auditLog.rowId}`} className="w-fit">
                Gå til endret {tableLink.label}
              </TextLink>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-0">
          <nav className="flex overflow-x-auto shadow-[inset_0_-2px_0_0_var(--border)]" aria-label="Seksjoner">
            <button type="button" className={tabClassName(tab === "json")} onClick={() => setTab("json")}>
              <IconAlignJustified className="size-3.5 shrink-0" />
              Json
            </button>
            <button type="button" className={tabClassName(tab === "changes")} onClick={() => setTab("changes")}>
              <IconPlusMinus className="size-3.5 shrink-0" />
              Endringer
            </button>
          </nav>
          <TabsContent value="json" className="min-h-0 flex-1 overflow-auto pt-4">
            <AuditLogDetails auditLog={auditLog} view="json" />
          </TabsContent>
          <TabsContent value="changes" className="min-h-0 flex-1 overflow-auto pt-4">
            <AuditLogDetails auditLog={auditLog} view="changes" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
