"use client"

import { Box, Collapse, Group, Paper, Stack, Title } from "@mantine/core"
import { useAuditLogDetailsQuery } from "./provider"
import { Text } from "@mantine/core"
import { formatDate } from "date-fns"
import { diff } from "json-diff-ts"
import { useDisclosure } from "@mantine/hooks"
import { IconCaretDownFilled } from "@tabler/icons-react"




export default function AuditLogDetailsPage() {
  
  const { auditLog } = useAuditLogDetailsQuery()
  return (

      <Stack>

          <Title>Hendelse</Title>

          <Title order={4}>{formatDate(new Date(auditLog.createdAt),"dd.MM.yyyy HH:mm")}</Title>

            {Object.entries(auditLog.metadata ?? {}).map(([key, value]) => 
            {
              if (key === "changes" && typeof value === "object" && value !== null) {
                const changes = Object.entries(diff(value.before as object, value.after as object) || {})
                return (
                  
                  <Paper p="md" withBorder key={key} title={key}> 
                  <Text><strong> Changes: </strong></Text>
                    {changes.map(([key, value]) => {
                    const [opened, { toggle }] =  useDisclosure(false);
                    return (

                      <Box mx="auto">
                        <Group mb={5} onClick={toggle}>
                          <Text>{value.key}</Text>
                          <IconCaretDownFilled width={14} height={14}></IconCaretDownFilled>
                        </Group> 
                        <Collapse in={opened}>
                          <strong>{value.type}:</strong> {value.value}
                        </Collapse>
                      </Box>
                    )
                    })
                    }
                  </Paper>
                )
              }
              return (
                <Paper p="md" withBorder key={key} title={key}> 
                  <Text>
                    <strong>{key}:</strong> {String(value)}
                  </Text>
                </Paper>
              )
            }

          
          )}

      </Stack>
  )
}
