"use client"

import { CheckboxField } from "@/components/forms/CheckboxField"
import { Form } from "@/components/forms/Form"
import { ImageUploadModalField } from "@/components/forms/ImageUploadModalField"
import { RichTextField } from "@/components/forms/RichTextField"
import { SegmentedControlField } from "@/components/forms/SegmentedControlField"
import { SelectField } from "@/components/forms/SelectField"
import { TextField } from "@/components/forms/TextField"
import {
  getGroupDisplayName,
  getGroupMemberVisibilityName,
  getGroupPreferredDisplayNameLabel,
  getGroupRecruitmentMethodName,
  getGroupTypeName,
  GROUP_IMAGE_MAX_SIZE_KIB,
  type GroupId,
  GroupMemberVisibilitySchema,
  GroupRecruitmentMethodSchema,
  GroupTypeSchema,
  type GroupWrite,
  GroupWriteSchema,
} from "@dotkomonline/rpc/group"
import { Button, Text } from "@dotkomonline/ui"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm, type UseFormReturn, useWatch } from "react-hook-form"
import z from "zod"
import { useGroupFileUploadMutation } from "../mutations"
import { useGroupAllQuery } from "../queries"

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
  memberVisibility: "NONE",
  isActive: true,
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

interface GroupWriteFormProps {
  onSubmit(data: GroupWrite): void
  defaultValues?: Partial<GroupWrite>
  submitLabel?: string
  disabled?: boolean
}

export const GroupWriteForm = ({
  onSubmit,
  submitLabel = "Lag ny gruppe",
  defaultValues = DEFAULT_VALUES,
  disabled,
}: GroupWriteFormProps) => {
  const { groups } = useGroupAllQuery()
  const existingGroupSlugs = groups.map((group) => group.slug)
  const fileUpload = useGroupFileUploadMutation()

  const validationSchema = useMemo(
    () =>
      FormSchema.superRefine((data, ctx) => {
        const issues = validateGroupWrite(data, existingGroupSlugs, defaultValues.slug)
        for (const issue of issues) {
          ctx.addIssue({ code: "custom", message: issue.message, path: issue.path })
        }
      }),
    [existingGroupSlugs, defaultValues.slug]
  )

  const form = useForm<FormInput, unknown, FormResult>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      ...defaultValues,
      isActive: defaultValues.deactivatedAt ? false : ((defaultValues as Partial<FormResult>).isActive ?? true),
    },
    disabled,
  })

  return (
    <Form
      form={form as UseFormReturn<FormResult>}
      onSubmit={(data) => {
        const deactivatedAt = data.isActive ? null : getCurrentUTC()

        onSubmit({
          type: data.type,
          abbreviation: data.abbreviation,
          name: data.name,
          preferredDisplayName: data.preferredDisplayName,
          description: data.description,
          imageUrl: data.imageUrl,
          email: data.email,
          contactUrl: data.contactUrl,
          slackUrl: data.slackUrl,
          showLeaderAsContact: data.showLeaderAsContact,
          memberVisibility: data.memberVisibility,
          recruitmentMethod: data.recruitmentMethod,
          slug: data.slug,
          deactivatedAt,
          workspaceGroupId: defaultValues?.workspaceGroupId ?? null,
        })
      }}
    >
      {defaultValues.slug && (
        <TextField control={form.control} name="slug" label="Slug" placeholder="dotkom" required />
      )}
      <TextField control={form.control} name="name" label="Navn" placeholder="Drifts- og utviklingskomiteen" />
      <TextField control={form.control} name="abbreviation" label="Kort navn" placeholder="Dotkom" required />
      <div className="flex flex-col gap-1">
        <SegmentedControlField
          fixedWidth
          control={form.control}
          name="preferredDisplayName"
          label="Visningsnavn"
          description="Dette er navnet som vises på nettsiden."
          required
          fullWidth
          options={[
            { value: "ABBREVIATION", label: getGroupPreferredDisplayNameLabel("ABBREVIATION") },
            { value: "NAME", label: getGroupPreferredDisplayNameLabel("NAME") },
          ]}
        />
        <PreferredDisplayNamePreview control={form.control} />
      </div>
      <RichTextField control={form.control} name="description" label="Beskrivelse" required onFileUpload={fileUpload} />
      <TextField
        control={form.control}
        name="email"
        label="Kontakt-e-post"
        placeholder="dotkom@online.ntnu.no"
        type="email"
      />
      <CheckboxField control={form.control} name="showLeaderAsContact" label="Vis leder som kontakt" />
      <SelectField
        control={form.control}
        name="memberVisibility"
        label="Hvilke medlemmer skal vises"
        placeholder="Velg en"
        options={GroupMemberVisibilitySchema.options.map((groupMemberVisibilityType) => ({
          value: groupMemberVisibilityType,
          label: getGroupMemberVisibilityName(groupMemberVisibilityType),
        }))}
      />
      <TextField control={form.control} name="slackUrl" label="Slack-lenke" />
      <TextField control={form.control} name="contactUrl" label="Kontakt-lenke" />
      <ImageUploadModalField
        control={form.control}
        name="imageUrl"
        label="Bilde"
        maxSizeKiB={GROUP_IMAGE_MAX_SIZE_KIB}
        onFileUpload={fileUpload}
      />
      <SelectField
        control={form.control}
        name="type"
        label="Type"
        placeholder="Velg en"
        required
        options={GroupTypeSchema.options.map((groupType) => ({
          value: groupType,
          label: getGroupTypeName(groupType),
        }))}
      />
      <SelectField
        control={form.control}
        name="recruitmentMethod"
        label="Opptaksmåte"
        description="Hvordan har denne gruppen ordinært opptak?"
        placeholder="Velg en"
        required
        options={GroupRecruitmentMethodSchema.options.map((recruitmentMethod) => ({
          value: recruitmentMethod,
          label: getGroupRecruitmentMethodName(recruitmentMethod),
        }))}
      />
      <CheckboxField control={form.control} name="isActive" label="Aktiv" />
      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}

function PreferredDisplayNamePreview({ control }: { control: ReturnType<typeof useForm<FormInput>>["control"] }) {
  const preferredDisplayName = useWatch({ control, name: "preferredDisplayName" })
  const name = useWatch({ control, name: "name" })
  const abbreviation = useWatch({ control, name: "abbreviation" })

  const displayName = getGroupDisplayName({
    preferredDisplayName: preferredDisplayName ?? "ABBREVIATION",
    name: name ?? "",
    abbreviation: abbreviation ?? "",
  })

  return <Text className="text-sm text-muted-foreground">Forhåndsvisning: {displayName || "—"}</Text>
}
