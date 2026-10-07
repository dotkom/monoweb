import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./Table"

export default {
  title: "Table",
  component: Table,
}

const members = [
  { name: "Anna Hansen", committee: "Dotkom", role: "Leder" },
  { name: "Jonas Berg", committee: "Arrkom", role: "Medlem" },
  { name: "Sara Olsen", committee: "Fagkom", role: "Medlem" },
]

export const Default = () => (
  <div className="max-w-2xl">
    <Table>
      <TableCaption>Medlemmer i Onlines komiteer.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Navn</TableHead>
          <TableHead>Komité</TableHead>
          <TableHead className="text-right">Rolle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.name}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell>{member.committee}</TableCell>
            <TableCell className="text-right">{member.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Antall medlemmer</TableCell>
          <TableCell className="text-right">{members.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
)

export const Empty = () => (
  <div className="max-w-2xl">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Navn</TableHead>
          <TableHead>Komité</TableHead>
          <TableHead className="text-right">Rolle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
            Ingen medlemmer funnet.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
)
