import {
  type GroupId,
  GroupMemberVisibilitySchema,
  GroupRecruitmentMethodSchema,
  GroupTypeSchema,
  type GroupWrite,
  GroupWriteSchema,
  getGroupMemberVisibilityName,
  getGroupRecruitmentMethodName,
  getGroupTypeName,
} from "@dotkomonline/types"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { useMemo } from "react"
import z from "zod"
import { useGroupFileUploadMutation } from "@/app/(internal)/group/mutations"
import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
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
  recruitmentMethod: "NONE",
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
          ctx.addIssue(issue)
        }
      }),
    [existingGroupSlugs, defaultValues]
  )

  const fileUpload = useGroupFileUploadMutation()

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
        onFileUpload: fileUpload,
      }),
      email: createTextInput({
        label: "Kontakt-e-post",
        placeholder: "dotkom@online.ntnu.no",
        type: "email",
      }),
      showLeaderAsContact: createCheckboxInput({
        label: "Vis leder som kontakt",
      }),
      memberVisibility: createSelectInput({
        label: "Hvilke medlemmer skal vises",
        placeholder: "Velg en",
        data: Object.values(GroupMemberVisibilitySchema.Values).map((groupMemberVisibilityType) => ({
          value: groupMemberVisibilityType,
          label: getGroupMemberVisibilityName(groupMemberVisibilityType),
        })),
      }),
      contactUrl: createTextInput({
        label: "Kontakt-lenke",
      }),
      imageUrl: createImageInput({
        label: "Bilde",
        placeholder: "Last opp",
        onFileUpload: fileUpload,
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "Velg en",
        withAsterisk: true,
        required: true,
        data: Object.values(GroupTypeSchema.Values).map((groupType) => ({
          value: groupType,
          label: getGroupTypeName(groupType),
        })),
      }),
      recruitmentMethod: createSelectInput({
        label: "Opptaksmåte",
        description: "Hvordan har denne gruppen ordinært opptak?",
        placeholder: "Velg en",
        withAsterisk: true,
        required: true,
        data: Object.values(GroupRecruitmentMethodSchema.Values).map((recruitmentMethod) => ({
          value: recruitmentMethod,
          label: getGroupRecruitmentMethodName(recruitmentMethod),
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
