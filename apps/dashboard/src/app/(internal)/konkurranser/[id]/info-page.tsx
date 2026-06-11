"use client"

import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { createMultipleSelectInput } from "@/components/forms/MultiSelectInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { ContestUpdateSchema } from "@dotkomonline/rpc/contest"
import { getGroupDisplayName } from "@dotkomonline/types"
import { Stack } from "@mantine/core"
import type { z } from "zod"
import { useContestEditPermission } from "@/hooks/use-contest-edit-permission"
import { useUpdateContestMutation } from "../mutations"
import { useContestContext } from "./provider"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"

const RESULT_TYPE_OPTIONS = [
  { value: "SCORE", label: "Poeng" },
  { value: "DURATION", label: "Tid" },
  { value: "WINNER", label: "Vinner" },
]

const RESULT_ORDER_OPTIONS = [
  { value: "ASC", label: "Lavest verdi vinner" },
  { value: "DESC", label: "Høyest verdi vinner" },
]

const FormSchema = ContestUpdateSchema

type FormValues = z.infer<typeof FormSchema>

export const InfoPage = () => {
  const { contest } = useContestContext()
  const canEdit = useContestEditPermission()
  const updateContest = useUpdateContestMutation()
  const { groups } = useGroupAllQuery()

  const FormComponent = useFormBuilder({
    schema: FormSchema,
    defaultValues: {
      name: contest.name,
      description: contest.description,
      startDate: contest.startDate ? new Date(contest.startDate) : null,
      resultType: contest.resultType,
      resultOrder: contest.resultOrder,
      groups: [...contest.groups],
    } satisfies FormValues,
    onSubmit: (data) => {
      updateContest.mutate({
        contestId: contest.id,
        contest: {
          name: data.name,
          description: data.description || null,
          startDate: data.startDate ?? null,
          resultType: data.resultType,
          resultOrder: data.resultOrder,
          groups: data.groups,
        },
      })
    },
    label: "Oppdater konkurranse",
    disabled: !canEdit,
    fields: {
      name: createTextInput({
        label: "Navn",
        withAsterisk: true,
      }),
      description: createRichTextInput({
        label: "Beskrivelse",
        required: false,
      }),
      groups: createMultipleSelectInput({
        label: "Arrangørkomiteer",
        placeholder: "Velg én eller flere komiteer",
        data: groups.map((group) => ({ value: group.slug, label: getGroupDisplayName(group) })),
        searchable: true,
        required: true,
        withAsterisk: true,
      }),
      startDate: createDateTimeInput({
        label: "Startdato",
        placeholder: "Start nå",
      }),
      resultType: createSelectInput({
        label: "Type konkurranse",
        data: RESULT_TYPE_OPTIONS,
        withAsterisk: true,
      }),
      resultOrder: createSelectInput({
        label: "Sortering",
        data: RESULT_ORDER_OPTIONS,
        withAsterisk: true,
      }),
    },
  })

  return (
    <Stack>
      <FormComponent />
    </Stack>
  )
}
