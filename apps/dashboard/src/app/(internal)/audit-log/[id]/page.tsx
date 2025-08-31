"use client"

import { Paper, Stack, Title } from "@mantine/core"
import { useAuditLogDetailsQuery } from "./provider"
import { Text } from "@mantine/core"
import { formatDate } from "date-fns"



export default function AuditLogDetailsPage() {
  
  const { auditLog } = useAuditLogDetailsQuery()
  return (

      <Stack>

          <Title>Hendelse</Title>

          <Title order={4}>{formatDate(new Date(auditLog.createdAt),"dd.MM.yyyy HH:mm")}</Title>

            {Object.entries(auditLog.metadata ? auditLog.metadata : {}).map(([key, value]) => (
            <Paper p="md" withBorder key={key} title={key}> 
              <Text>
                <strong>{key}:</strong> {String(value)}
              </Text>
            </Paper>
          ))}

      </Stack>
  )
}
