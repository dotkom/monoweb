"use client"

import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { ContestUpdateSchema } from "@dotkomonline/types"
import { Text } from "@mantine/core"
import type { z } from "zod"
import { useUpdateContestMutation } from "../mutations"
import { useContestContext } from "./provider"

const RESULT_TYPE_OPTIONS = [
  { value: "SCORE", label: "Poeng" },
  { value: "DURATION", label: "Tid" },
  { value: "WINNER", label: "Vinner" },
]

const RESULT_ORDER_OPTIONS = [
  { value: "ASC", label: "Lavest vinner" },
  { value: "DESC", label: "Høyest vinner" },
]

const FormSchema = ContestUpdateSchema

type FormValues = z.infer<typeof FormSchema>

export const InfoPage = () => {
  const { contest } = useContestContext()
  const updateContest = useUpdateContestMutation()
  const { groups } = useGroupAllQuery()

  const groupLabel = groups.find((g) => g.slug === contest.groupId)?.abbreviation ?? contest.groupId

  const FormComponent = useFormBuilder({
    schema: FormSchema,
    defaultValues: {
      name: contest.name,
      description: contest.description,
      startDate: contest.startDate ? new Date(contest.startDate) : null,
      resultType: contest.resultType,
      resultOrder: contest.resultOrder,
    } satisfies FormValues,
    onSubmit: (data) => {
      updateContest.mutate({
        id: contest.id,
        input: {
          name: data.name,
          description: data.description || null,
          startDate: data.startDate ?? null,
          resultType: data.resultType,
          resultOrder: data.resultOrder,
        },
      })
    },
    label: "Oppdater konkurranse",
    fields: {
      name: createTextInput({
        label: "Navn",
        withAsterisk: true,
      }),
      description: createTextInput({
        label: "Beskrivelse",
      }),
      startDate: createDateTimeInput({
        label: "Startdato",
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
    <>
      <Text size="sm" c="dimmed" mb="md">
        Komite: <strong>{groupLabel}</strong> (kan ikke endres)
      </Text>
      <FormComponent />
    </>
  )
}
