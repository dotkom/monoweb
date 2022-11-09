import { Title, Text, Table, TableHead, TableRow, TableBody, TableHeaderCell, TableCell, Button } from "@tremor/react"
import { FC } from "react"

export const EventPage: FC = () => {
  return (
    <div className="w-full p-6 flex flex-col gap-4">
      <div>
        <Title>Arrangmenter</Title>
        <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
      </div>
      <div className="rounded bg-white shadow">
        <Table>
          <TableHead>
            <TableHeaderCell>Arrangement</TableHeaderCell>
            <TableHeaderCell>Startdato</TableHeaderCell>
            <TableHeaderCell>Sluttdato</TableHeaderCell>
            <TableHeaderCell>Arrangør</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Plasser</TableHeaderCell>
            <TableHeaderCell>Konfigurer</TableHeaderCell>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Åre</TableCell>
              <TableCell>2022-01-01</TableCell>
              <TableCell>2022-01-05</TableCell>
              <TableCell>Arrkom</TableCell>
              <TableCell>Sosialt</TableCell>
              <TableCell>25/150</TableCell>
              <TableCell>
                <Button text="Endre" importance="secondary" handleClick={() => alert("wow")} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button text="Opprett nytt arrangement" />
    </div>
  )
}
