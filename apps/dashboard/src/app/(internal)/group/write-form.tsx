import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { createFileInput } from "@/components/forms/FileInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createRichTextInput } from "@/components/forms/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { type GroupId, GroupTypeSchema, type GroupWrite, GroupWriteSchema, getGroupTypeName } from "@dotkomonline/types"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { useMemo } from "react"
import z from "zod"
import { useGroupAllQuery } from "./queries"

const FormSchema = GroupWriteSchema.omit({
  deactivatedAt: true,
  workspaceGroupId: true,
}).extend({
  isActive: z.boolean(),
})

type FormResult = z.infer<typeof FormSchema>

const DEFAULT_VALUES: Partial<FormResult> = {
  imageUrl: null,
}

interface UseGroupWriteFormProps {
  onSubmit(data: GroupWrite): void
  defaultValues?: Partial<GroupWrite>
  label?: string
}

export const useGroupWriteForm = ({
  onSubmit,
  label = "Lag ny gruppe",
  defaultValues = DEFAULT_VALUES,
}: UseGroupWriteFormProps) => {
  const { groups } = useGroupAllQuery()
  const existingGroupSlugs = groups.map((group) => group.slug)

  const validationSchema = useMemo(
    () =>
      FormSchema.superRefine((data, ctx) => {
        const issues = validateGroupWrite(data, existingGroupSlugs, defaultValues.slug)
        for (const issue of issues) {
          ctx.addIssue(issue.message)
        }
      }),
    [existingGroupSlugs, defaultValues]
  )

  return useFormBuilder({
    schema: validationSchema,
    defaultValues,
    onSubmit: (data) => {
      const deactivatedAt = data.isActive ? null : getCurrentUTC()

      onSubmit({
        ...data,
        deactivatedAt,
        workspaceGroupId: defaultValues?.workspaceGroupId ?? null,
      })
    },
    label,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Drifts- og utviklingskomiteen",
      }),
      slug: createTextInput({
        label: "Slug",
        placeholder: "dotkom",
        required: Boolean(defaultValues.slug),
      }),
      abbreviation: createTextInput({
        label: "Kort navn",
        placeholder: "Dotkom",
        withAsterisk: true,
        required: true,
      }),
      description: createRichTextInput({
        label: "Beskrivelse",
        required: true,
      }),
      email: createTextInput({
        label: "Kontakt-e-post",
        placeholder: "dotkom@online.ntnu.no",
        type: "email",
      }),
      contactUrl: createTextInput({
        label: "Kontakt-lenke",
      }),
      imageUrl: createFileInput({
        label: "Bilde",
        placeholder: "Last opp",
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "Velg en",
        withAsterisk: true,
        required: true,
        data: Object.values(GroupTypeSchema._zod.values).map((groupType) => ({
          value: groupType,
          label: getGroupTypeName(groupType),
        })),
      }),
      isActive: createCheckboxInput({
        label: "Aktiv",
        defaultChecked: !defaultValues?.deactivatedAt,
      }),
    },
  })
}

const validateGroupWrite = (group: FormResult, existingGroupSlugs: GroupId[], initialSlug?: string): z.ZodIssue[] => {
  const issues: z.ZodIssue[] = []

  if (!group.slug) {
    return issues
  }

  if (group.slug.trim().length < 2) {
    issues.push({
      code: "custom",
      message: "Slug må være minst 2 tegn lang",
      path: ["slug"],
    })
  }

  if (group.slug !== slugify(group.slug)) {
    issues.push({
      code: "custom",
      message: "Slug kan kun inneholde små bokstaver uten mellomrom eller spesialtegn",
      path: ["slug"],
    })
  }

  if (group.slug !== initialSlug && existingGroupSlugs.includes(group.slug)) {
    issues.push({
      code: "custom",
      message: "Slug er opptatt",
      path: ["slug"],
    })
  }

  return issues
}
