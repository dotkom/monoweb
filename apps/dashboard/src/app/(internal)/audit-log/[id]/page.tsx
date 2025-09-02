"use client"

import { Accordion, Stack, Title, useMantineColorScheme, useMantineTheme, virtualColor } from "@mantine/core"
import { useAuditLogDetailsQuery } from "./provider"
import { formatDate } from "date-fns"
import { StringDiff, DiffMethod } from "react-string-diff"


export default function AuditLogDetailsPage() {
  
  // Theme stuff for coloring the diff
  const theme = useMantineTheme();
  const {colorScheme} = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const diffStyles =  {
    added: { backgroundColor: isDark ? theme.colors.green[9] : theme.colors.green[5] , textDecoration: 'none' },
    removed: {backgroundColor: isDark ? theme.colors.red[9] : theme.colors.red[5], textDecoration: 'line-through' },
    default: { backgroundColor: 'transparent', textDecoration: 'none' },
  }
  
  // Fetches specific audit
  const { auditLog } = useAuditLogDetailsQuery()
  
  const entries = auditLog.rowData && Object.entries(auditLog.rowData).map(([field, change], index) => {

    if (field === "updatedAt") return null

    return (

      <pre key={index}>
            <Accordion.Item key={field} value={field}>
            <Accordion.Control>
              <strong>{field === "new" ? "Data lagt til" : field}</strong>

            </Accordion.Control>
              <Accordion.Panel>
                
                <div style={{ whiteSpace: 'pre-wrap', }}>
                  {change.old ?
                  <StringDiff // This component shows the string-difference
                  oldValue={change.old} 
                  newValue={change.new} 
                  method={DiffMethod.Words} 
                  key={colorScheme} 
                  styles={diffStyles}
                  />
                  :
                  Object.entries(change).map(([key, value]) => (
                    <div key={key}><strong>{key}:</strong> {String(value)}</div>
                  ))
                  }
                </div>

              </Accordion.Panel>
            </Accordion.Item>
      </pre>
    )
    }
    )
  if (!auditLog.rowData) return null
  return (

      <Stack>

          <Title order={2}>Hendelse utført av {auditLog.user?.name}</Title>

          <Title order={4}>{formatDate(new Date(auditLog.createdAt),"dd.MM.yyyy HH:mm")}</Title>

                <Accordion defaultValue="Logs">
                  {entries}
                </Accordion>

      </Stack>
  )
}
