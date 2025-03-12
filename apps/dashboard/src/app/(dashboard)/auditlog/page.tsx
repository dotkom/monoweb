"use client"
import { Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { useAuditlogAllQuery } from "src/modules/auditlog/queries/use-auditlog-all-query"
import { Icon } from "@iconify/react/dist/iconify.js"
import { GenericTable } from "../../../components/GenericTable"
import { useAuditlogTable } from "src/modules/auditlog/use-auditlog-table"

export default function Auditlog() {
  const { auditlogs, isLoading: isAuditlogLoading } = useAuditlogAllQuery()
  const table = useAuditlogTable({ data: auditlogs })

  return (
    <Skeleton visible={isAuditlogLoading}>
      <Stack>
        <GenericTable table={table} />
          <Group justify="space-between">
              <ButtonGroup>
              </ButtonGroup>
              <Button variant="subtle">
                <Icon icon="tabler:caret-left" />
              </Button>
              <Button variant="subtle">
                <Icon icon="tabler:caret-right" />
              </Button>
            </Group>
      </Stack>
    </Skeleton>
  )
}

