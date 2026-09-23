"use client"

import type { AuditLog } from "@dotkomonline/rpc/audit-log"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"
import { useTheme } from "next-themes"
import { DiffMethod, StringDiff } from "react-string-diff"
import "./audit-log-diff.css"

interface Props {
  auditLog: AuditLog
  view?: "json" | "changes"
}

export const AuditLogDetails = ({ auditLog, view = "json" }: Props) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const diffStyles = {
    added: {
      backgroundColor: isDark ? "var(--diff-added-bg-dark)" : "var(--diff-added-bg-light)",
      textDecoration: "none",
      color: isDark ? "var(--diff-added-fg-dark)" : "var(--diff-added-fg-light)",
    },
    removed: {
      backgroundColor: isDark ? "var(--diff-removed-bg-dark)" : "var(--diff-removed-bg-light)",
      textDecoration: "line-through",
      color: isDark ? "var(--diff-removed-fg-dark)" : "var(--diff-removed-fg-light)",
    },
    default: { backgroundColor: "transparent", textDecoration: "none" },
  }

  const changed_fields = isRecord(auditLog.rowData)
    ? Object.entries(auditLog.rowData).map(([field, change]) => {
        if (!isRecord(change)) {
          return null
        }

        return (
          <AccordionItem key={field} value={field}>
            <AccordionTrigger>
              <strong>{field === "new" ? "Data lagt til" : field}</strong>
            </AccordionTrigger>
            <AccordionContent>
              <div className="whitespace-pre-wrap">
                {change.old ? (
                  <StringDiff
                    oldValue={String(change.old)}
                    newValue={String(change.new ?? "")}
                    method={DiffMethod.Lines}
                    styles={diffStyles}
                    key={isDark ? "dark" : "light"}
                  />
                ) : (
                  Object.entries(change).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })
    : null

  const rowDataLength = isRecord(auditLog.rowData) ? Object.keys(auditLog.rowData).length : 0

  const defaultValue = isRecord(auditLog.rowData) && rowDataLength === 1 ? [Object.keys(auditLog.rowData)[0]] : []

  if (view === "changes") {
    return (
      <Accordion multiple className="w-full" defaultValue={defaultValue}>
        {changed_fields}
      </Accordion>
    )
  }

  return <pre>{JSON.stringify(auditLog.rowData, null, 2)}</pre>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false
  }

  return true
}
