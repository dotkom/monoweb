"use client"

import { Title, Text, Table, TableHead, TableRow, TableBody, TableHeaderCell, TableCell, Button } from "@tremor/react"

import { useFlyout } from "../../components/Flyout"
import { useModal } from "../../components/Modal"
import { MarkCreationModal } from "./MarkCreationModal"
import { MarkDetailsFlyout } from "./MarkDetailsFlyout"
import { trpc } from "../../trpc"

export default function MarksPage() {
  const { Flyout, open: openDetailsFlyout } = useFlyout(MarkDetailsFlyout)
  const { Modal, open: openCreationModal } = useModal(MarkCreationModal)

  const { data = [], isLoading } = trpc.mark.all.useQuery({ offset: 0, limit: 50 })
  // TODO: use tanstack table

  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <Flyout />
      <Modal />
      <div>
        <Title>Prikker</Title>
        <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
      </div>
      <div className="rounded bg-white shadow">
        {isLoading ? (
          "Loading"
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Tittel</TableHeaderCell>
                <TableHeaderCell>Antall mottakere</TableHeaderCell>
                <TableHeaderCell>Gitt</TableHeaderCell>
                <TableHeaderCell>Kategori</TableHeaderCell>
                <TableHeaderCell>Varighet</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((mark) => (
                <TableRow key={mark.id}>
                  <TableCell>{mark.title}</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>{mark.givenAt.toLocaleTimeString()}</TableCell>
                  <TableCell>{mark.category}</TableCell>
                  <TableCell>{mark.duration}</TableCell>
                  <TableCell>
                    <Button text="Endre" importance="secondary" handleClick={openDetailsFlyout} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Button text="Lag ny prikk" handleClick={openCreationModal} />
    </div>
  )
}
