import { type AttendancePool } from "@dotkomonline/types"
import { Box, Table } from "@mantine/core"
import { type FC } from "react"
import { formatPoolYearCriterias } from "./utils"

export const InfoBox: FC<{ pools: AttendancePool[] }> = ({ pools }) => {
  const all = [0, 1, 2, 3, 4, 5]

  const notIncluded = (ranges: number[][]): number[] => {
    const flat = ranges.flat()
    return all.filter((num) => !flat.includes(num))
  }
  return (
    <Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Td>Totalt antall plasser</Table.Td>
            <Table.Td>{pools.reduce((acc, pool) => acc + pool.limit, 0)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Grupper med reserverte plasser</Table.Td>
            <Table.Td>
              {formatPoolYearCriterias(pools.filter(({ limit }) => limit !== 0).map(({ yearCriteria }) => yearCriteria))}
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Grupper som kan melde seg på etter sammenslåing</Table.Td>
            <Table.Td>
              {formatPoolYearCriterias(pools.filter((ev) => ev.limit === 0).map(({ yearCriteria }) => yearCriteria))}
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Grupper som ikke vil få tilgang til arrangement</Table.Td>
            <Table.Td>{notIncluded(pools.map(({ yearCriteria }) => yearCriteria)).join(", ")}</Table.Td>
          </Table.Tr>
        </Table.Thead>
      </Table>
    </Box>
  )
}
