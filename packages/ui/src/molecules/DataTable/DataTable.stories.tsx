import {
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { type MouseEvent, useState } from "react"
import { IconEyeDotted } from "@tabler/icons-react"
import { Badge } from "../../atoms/Badge/Badge"
import { TextLink } from "../../atoms/Typography/TextLink"
import { DataTable } from "./DataTable"

export default {
  title: "DataTable",
  component: DataTable,
}

type Member = {
  id: string
  name: string
  committee: string
  role: string
}

const members: Member[] = [
  { id: "anna", name: "Anna Hansen", committee: "Dotkom", role: "Leder" },
  { id: "jonas", name: "Jonas Berg", committee: "Arrkom", role: "Medlem" },
  { id: "sara", name: "Sara Olsen", committee: "Fagkom", role: "Medlem" },
  { id: "emil", name: "Emil Nilsen", committee: "Bedkom", role: "Økonomiansvarlig" },
]

const columns: ColumnDef<Member>[] = [
  { accessorKey: "name", header: "Navn" },
  { accessorKey: "committee", header: "Komité", meta: { fit: true } },
  { accessorKey: "role", header: "Rolle", meta: { wrap: true } },
]

const scrollableMembers = members.flatMap((member) =>
  Array.from({ length: 8 }, (_unusedValue, memberIndex) => ({
    ...member,
    id: `${member.id}-${memberIndex}`,
  }))
)

function MemberTable({
  data = members,
  sortable = false,
  clickable = false,
  isLoading = false,
}: {
  data?: Member[]
  sortable?: boolean
  clickable?: boolean
  isLoading?: boolean
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const table = useReactTable({
    data,
    columns,
    getRowId: (member) => member.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    enableSorting: sortable,
  })

  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <DataTable
        table={table}
        filterable={sortable}
        isLoading={isLoading}
        onRowClick={clickable ? (row) => setSelectedMember(row.original) : undefined}
        getRowClassName={(row) => (row.original.id === selectedMember?.id ? "bg-muted" : undefined)}
      />
      {clickable && <p className="text-sm text-muted-foreground">Valgt medlem: {selectedMember?.name ?? "Ingen"}</p>}
    </div>
  )
}

export const Default = () => <MemberTable />

export const Sortable = () => <MemberTable sortable />

export const Empty = () => <MemberTable data={[]} />

export const Loading = () => <MemberTable data={[]} isLoading />

export const Scrollable = () => <MemberTable data={scrollableMembers} sortable />

export const ClickableRows = () => <MemberTable clickable />

type Event = {
  id: string
  title: string
  start: string
  organizer: string
  type: string
  isDraft: boolean
}

const events: Event[] = [
  {
    id: "bedriftspresentasjon",
    title: "Bedriftspresentasjon med Bekk",
    start: "12. oktober 2026",
    organizer: "Bedkom",
    type: "Bedriftspresentasjon",
    isDraft: false,
  },
  {
    id: "kurs",
    title: "Introduksjon til React",
    start: "15. oktober 2026",
    organizer: "Fagkom",
    type: "Kurs",
    isDraft: true,
  },
  {
    id: "quiz",
    title: "Quizkveld",
    start: "20. oktober 2026",
    organizer: "Arrkom",
    type: "Sosialt",
    isDraft: false,
  },
]

export const LinkedCells = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const eventColumns: ColumnDef<Event>[] = [
    {
      accessorKey: "title",
      header: () => <span className="ml-1">Arrangement</span>,
      meta: { smallPadding: true },
      cell: ({ row }) => {
        const event = row.original

        return (
          <TextLink
            element="a"
            href={`#${event.id}`}
            className="text-sm"
            onClick={(clickEvent: MouseEvent<HTMLAnchorElement>) => {
              clickEvent.preventDefault()
              setSelectedEvent(event)
            }}
          >
            <span className="block w-full rounded-sm px-1 py-1 text-sm no-underline transition-colors duration-75 hover:bg-blue-500/10">
              {event.title}
              {event.isDraft && (
                <Badge color="orange" variant="secondary" className="inline-flex items-center gap-1 text-xs">
                  <IconEyeDotted size={14} />
                  Utkast
                </Badge>
              )}
            </span>
          </TextLink>
        )
      },
    },
    { accessorKey: "start", header: "Startdato" },
    { accessorKey: "organizer", header: "Arrangører" },
    { accessorKey: "type", header: "Type" },
  ]
  const table = useReactTable({
    data: events,
    columns: eventColumns,
    getRowId: (event) => event.id,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex max-w-5xl flex-col gap-3">
      <DataTable table={table} />
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Valgt arrangement: {selectedEvent?.title ?? "Ingen"}
      </p>
    </div>
  )
}
