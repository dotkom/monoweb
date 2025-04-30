import type { AttendancePool } from "@dotkomonline/types"
import { Box, Table } from "@mantine/core"
import type { FC } from "react"
import { formatPoolYearCriterias } from "./utils"

export const AttendancePoolsSection: FC<{ pools: AttendancePool[] }> = ({ pools }) => {
  return (
    <Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Td>Totalt antall plasser</Table.Td>
            <Table.Td>{pools.reduce((acc, pool) => acc + pool.capacity, 0)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Grupper med reserverte plasser</Table.Td>
            <Table.Td>
              {formatPoolYearCriterias(
                pools.filter(({ capacity }) => capacity !== 0).map(({ yearCriteria }) => yearCriteria)
              )}
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Grupper som ikke vil få tilgang til arrangement</Table.Td>
          </Table.Tr>
        </Table.Thead>
      </Table>
    </Box>
  )
}
