"use client"

import type { GroupId, GroupMember } from "@dotkomonline/rpc/group"
import { isGroupMemberActive } from "@dotkomonline/rpc/group"
import type { InterestGroupEventRegistration } from "@dotkomonline/rpc/interest-group-event"
import type { UserId } from "@dotkomonline/rpc/user"
import { Badge, DataTable, TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { DateTooltip } from "../../../components/DateTooltip"

const columnHelper = createColumnHelper<InterestGroupEventRegistration>()

interface Props {
  registrations: InterestGroupEventRegistration[]
  members: Map<UserId, GroupMember>
  interestGroupId: GroupId
  isLoading: boolean
}
export const InterestGroupEventRegistrationTable = ({ registrations, members, interestGroupId, isLoading }: Props) => {
  const isActiveMember = (userId: string) => {
    return isGroupMemberActive(members.get(userId) ?? null, interestGroupId)
  }

  const columns = [
    columnHelper.accessor((registration) => registration.user.name, {
      id: "name",
      header: () => "Navn",
      cell: (info) => <TextLink href={`/admin/brukere/${info.row.original.user.id}`}>{info.getValue()}</TextLink>,
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: () => "Påmeldingsdato",
      cell: (info) => <DateTooltip date={info.getValue()} />,
    }),
    columnHelper.accessor((registration) => isActiveMember(registration.user.id), {
      id: "isActiveMember",
      header: () => "Medlemsstatus",
      cell: (info) => {
        if (info.getValue()) {
          return <Badge color="green">Medlem</Badge>
        }

        return <Badge color="gray">Ikke medlem</Badge>
      },
    }),
  ]

  const table = useReactTable({
    data: registrations,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <DataTable table={table} isLoading={isLoading} />
}
