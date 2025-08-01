import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { GroupRoleTypeSchema, GroupRoleWriteSchema, getGroupRoleTypeName } from "@dotkomonline/types"
import type z from "zod"

const FormSchema = GroupRoleWriteSchema.omit({
    groupId: true,
})

type FormResult = z.infer<typeof FormSchema>

const DEFAULT_VALUES: Partial<FormResult> = {}

interface UseGroupRoleForm {
    onSubmit(data: FormResult): void
    defaultValues?: Partial<FormResult>
    label?: string
}

export const useGroupRoleForm = ({
    onSubmit,
    label = "Endre rolle",
    defaultValues = DEFAULT_VALUES,
}: UseGroupRoleForm) =>
    useFormBuilder({
        schema: FormSchema,
        defaultValues: defaultValues,
        onSubmit,
        label,
        fields: {
            name: createTextInput({
                label: "Navn",
                placeholder: "Vinstraffansvarlig",
                required: true,//TODO: ignore whitespace
            }),
            type: createSelectInput({
                label: "Type",
                placeholder: "Velg en",
                required: true,
                data: Object.values(GroupRoleTypeSchema.Values).map((groupRoleType) => ({
                    value: groupRoleType,
                    label: getGroupRoleTypeName(groupRoleType),
                })),
            }),
        },
    })
