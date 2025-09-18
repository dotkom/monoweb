"use client"

import { Accordion, Anchor, Stack, Tabs, Text, Title, useMantineColorScheme, useMantineTheme } from "@mantine/core"
import { formatDate } from "date-fns"
import { DiffMethod, StringDiff } from "react-string-diff"
import { useAuditLogDetailsQuery } from "./provider"
import Link from "next/link"

export default function AuditLogDetailsPage() {
  // Theme stuff for coloring the diff
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === "dark"

  const diffStyles = {
    added: { backgroundColor: isDark ? theme.colors.green[9] : theme.colors.green[5], textDecoration: "none" },
    removed: { backgroundColor: isDark ? theme.colors.red[9] : theme.colors.red[5], textDecoration: "line-through" },
    default: { backgroundColor: "transparent", textDecoration: "none" },
  }

  // need to map table names in the database to correct next js routes
  const tableNameMap  = {
    event: "event",
    ow_user: "user",
    job_listing: "job-listing",
    mark: "punishment",
    group: "group",
    company: "company",
    offline: "offline",
    article: "article",
  }

  const getTableNamePath = (tableName: string) => {
    return tableNameMap[tableName as keyof typeof tableNameMap] || tableName
  }

  // Fetches specific audit
  const { auditLog } = useAuditLogDetailsQuery()

  const changed_fields =
    auditLog.rowData &&
    Object.entries(auditLog.rowData).map(([field, change], index) => {
      return (
          <Accordion.Item key={field} value={field}>
            <Accordion.Control>
              <strong>{field === "new" ? "Data lagt til" : field}</strong>
            </Accordion.Control>
            <Accordion.Panel>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {change.old ? (
                  <StringDiff // This component shows the string-difference
                    oldValue={change.old}
                    newValue={change.new}
                    method={DiffMethod.Lines}
                    key={colorScheme}
                    styles={diffStyles}
                  />
                ) : (
                  Object.entries(change).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))
                )}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
      )
    })
  if (!auditLog.rowData) return null
  return (
    <Stack>

      <Title order={2}>
        Hendelse
      </Title>

      <Text size="sm">
        Utført av {auditLog.user?.name ? auditLog.user.name : "System"} 
       </Text>
       <Text size="sm" c="dimmed">
       {formatDate(new Date(auditLog.createdAt), "dd.MM.yyyy HH:mm")}
        </Text>
      <Text size="sm" mt="md">
      {tableNameMap.hasOwnProperty(auditLog.tableName) && 
        <>
          Gå til endret {auditLog.tableName} {" "}
          <Anchor component={Link} href={`/${getTableNamePath(auditLog.tableName)}/${auditLog.rowId}`}>
            her
          </Anchor> 
        </>
      }

      </Text>

      <Tabs defaultValue={"JSON"}>
        <Tabs.List>
          <Tabs.Tab value="JSON">JSON</Tabs.Tab>
          <Tabs.Tab value="details">Endringer</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel mt="md" value="details">
          <Accordion defaultValue="Logs">{changed_fields}</Accordion>
        </Tabs.Panel>
        <Tabs.Panel mt="md" value="JSON">
          <Accordion defaultValue="Logs">
            <pre>{JSON.stringify(auditLog.rowData, null, 2)}</pre>
          </Accordion>
        </Tabs.Panel>
    

      </Tabs>
    </Stack>
  )
}
