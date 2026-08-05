import { useGroupFileUploadMutation } from "@/app/(internal)/grupper/mutations"
import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createModalImageInput } from "@/components/forms/ImageInput"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createSegmentedControlInput } from "@/components/forms/SegmentedControlInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import type { InputFieldContext, InputProducerResult } from "@/components/forms/types"
import {
  GROUP_IMAGE_MAX_SIZE_KIB,
  type GroupId,
  GroupMemberVisibilitySchema,
  GroupRecruitmentMethodSchema,
  GroupTypeSchema,
  type GroupWrite,
  GroupWriteSchema,
  getGroupDisplayName,
  getGroupMemberVisibilityName,
  getGroupPreferredDisplayNameLabel,
  getGroupRecruitmentMethodName,
  getGroupTypeName,
} from "@dotkomonline/rpc/group"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { Stack, Text } from "@mantine/core"
import { useMemo } from "react"
import { useWatch } from "react-hook-form"
import z from "zod"
import { useGroupAllQuery } from "./queries"

const FormSchema = GroupWriteSchema.omit({
  deactivatedAt: true,
  workspaceGroupId: true,
}).extend({
  isActive: z.boolean(),
})

type FormInput = z.input<typeof FormSchema>
type FormResult = z.output<typeof FormSchema>

const DEFAULT_VALUES: Partial<FormResult> = {
  imageUrl: null,
  recruitmentMethod: "NONE",
  preferredDisplayName: "ABBREVIATION",
}

interface UseGroupWriteFormProps {
  onSubmit(data: GroupWrite): void
  defaultValues?: Partial<GroupWrite>
  label?: string
  disabled?: boolean
}

export const useGroupWriteForm = ({
  onSubmit,
  label = "Lag ny gruppe",
  defaultValues = DEFAULT_VALUES,
  disabled,
}: UseGroupWriteFormProps) => {
  const { groups } = useGroupAllQuery()
  const existingGroupSlugs = groups.map((group) => group.slug)

  const validationSchema = useMemo(
    () =>
      FormSchema.superRefine((data, ctx) => {
        const issues = validateGroupWrite(data, existingGroupSlugs, defaultValues.slug)
        for (const issue of issues) {
          ctx.addIssue({ code: "custom", message: issue.message, path: issue.path })
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
    disabled,
    fields: {
      slug: createTextInput({
        label: "Slug",
        placeholder: "dotkom",
        required: Boolean(defaultValues.slug),
      }),
      name: createTextInput({
        label: "Navn",
        placeholder: "Drifts- og utviklingskomiteen",
      }),
      abbreviation: createTextInput({
        label: "Kort navn",
        placeholder: "Dotkom",
        withAsterisk: true,
        required: true,
      }),
      preferredDisplayName: createPreferredDisplayNameField(),
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
        data: Object.values(GroupMemberVisibilitySchema.enum).map((groupMemberVisibilityType) => ({
          value: groupMemberVisibilityType,
          label: getGroupMemberVisibilityName(groupMemberVisibilityType),
        })),
      }),
      slackUrl: createTextInput({
        label: "Slack-lenke",
      }),
      contactUrl: createTextInput({
        label: "Kontakt-lenke",
      }),
      imageUrl: createModalImageInput({
        label: "Bilde",
        maxSizeKiB: GROUP_IMAGE_MAX_SIZE_KIB,
        onFileUpload: fileUpload,
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "Velg en",
        withAsterisk: true,
        required: true,
        data: Object.values(GroupTypeSchema.enum).map((groupType) => ({
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
        data: Object.values(GroupRecruitmentMethodSchema.enum).map((recruitmentMethod) => ({
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

const validateGroupWrite = (
  group: FormResult,
  existingGroupSlugs: GroupId[],
  initialSlug?: string
): z.core.$ZodIssue[] => {
  const issues: z.core.$ZodIssue[] = []

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

  if (group.preferredDisplayName === "NAME" && !group.name?.trim()) {
    issues.push({
      code: "custom",
      message: "Offisielt navn må fylles ut når det er valgt som visningsnavn",
      path: ["name"],
    })
  }

  return issues
}

function createPreferredDisplayNameField(): InputProducerResult<FormInput, FormResult> {
  const PreferredDisplayNameInput = createSegmentedControlInput<FormInput, FormResult>({
    label: "Visningsnavn",
    description: "Dette er navnet som vises på nettsiden.",
    withAsterisk: true,
    required: true,
    data: [
      { value: "ABBREVIATION", label: getGroupPreferredDisplayNameLabel("ABBREVIATION") },
      { value: "NAME", label: getGroupPreferredDisplayNameLabel("NAME") },
    ],
  })

  return function PreferredDisplayNameField(context) {
    return (
      <Stack gap="xs">
        <PreferredDisplayNameInput {...context} />
        <PreferredDisplayNamePreview control={context.control} />
      </Stack>
    )
  }
}

function PreferredDisplayNamePreview({ control }: Pick<InputFieldContext<FormInput>, "control">) {
  const preferredDisplayName = useWatch({ control, name: "preferredDisplayName" })
  const name = useWatch({ control, name: "name" })
  const abbreviation = useWatch({ control, name: "abbreviation" })

  const displayName = getGroupDisplayName({
    preferredDisplayName: preferredDisplayName ?? "ABBREVIATION",
    name: name ?? "",
    abbreviation: abbreviation ?? "",
  })

  return (
    <Text size="sm" c="dimmed">
      Forhåndsvisning: {displayName || "—"}
    </Text>
  )
}
