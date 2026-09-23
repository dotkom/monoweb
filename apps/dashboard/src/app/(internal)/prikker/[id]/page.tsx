"use client"

import { UserSearch } from "@/app/(internal)/brukere/components/UserSearch"
import { Button, Popover, PopoverContent, PopoverTrigger, Separator, Title } from "@dotkomonline/ui"
import { IconUserPlus } from "@tabler/icons-react"
import { useState } from "react"
import { MarkWriteForm } from "../MarkWriteForm"
import { PersonalMarkTable } from "../PersonalMarkTable"
import { useAddPersonalMarkToUserMutation, useEditMarkMutation } from "../mutations"
import { usePersonalMarkDetailsByMarkQuery } from "../queries"
import { useMarkDetailsContext } from "./provider"

export default function MarkEditCard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const { mark } = useMarkDetailsContext()
  const edit = useEditMarkMutation()
  const { personalMarks, isLoading } = usePersonalMarkDetailsByMarkQuery(mark.id)
  const giveMark = useAddPersonalMarkToUserMutation(mark.id)

  return (
    <div className="flex flex-col gap-4">
      <MarkWriteForm
        submitLabel="Oppdater prikk"
        onSubmit={(data) => {
          edit.mutate({ changes: { ...data, id: mark.id, type: "MANUAL" }, groupIds: data.groupIds })
        }}
        defaultValues={{ ...mark, groupIds: mark.groups.map((group) => group.slug) }}
      />

      <Separator />

      <Title element="h2" className="text-2xl">
        Gi {mark.weight === 6 ? "suspensjon" : "prikk"} til brukere
      </Title>

      <PersonalMarkTable
        markId={mark.id}
        personalMarks={personalMarks}
        isLoading={isLoading}
        actions={
          <Popover open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <PopoverTrigger asChild>
              <Button variant="default" icon={<IconUserPlus className="size-4" />}>
                Gi prikk
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              {isAddModalOpen && (
                <UserSearch
                  listOpen
                  autoHightlight
                  excludeUserIds={personalMarks.map((personalMark) => personalMark.user.id)}
                  placeholder="Søk etter navn eller e-post"
                  onSubmit={(user) => {
                    giveMark.mutate({ userId: user.id, markId: mark.id })
                  }}
                />
              )}
            </PopoverContent>
          </Popover>
        }
      />
    </div>
  )
}
