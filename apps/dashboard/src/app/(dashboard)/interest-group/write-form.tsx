import {
  InterestGroupWrite,
  InterestGroupWriteSchema,
} from "@dotkomonline/types";
import {
  createTextInput,
  createTextareaInput,
  useFormBuilder,
} from "src/app/form";

const INTEREST_GROUP_FORM_DEFAULT_VALUES: Partial<InterestGroupWrite> = {};

interface UseInterestGroupWriteFormProps {
  onSubmit(data: InterestGroupWrite): void;
  defaultValues?: Partial<InterestGroupWrite>;
  label?: string;
}

export const useInterestGroupWriteForm = ({
  onSubmit,
  label = "Create new interest group",
  defaultValues = INTEREST_GROUP_FORM_DEFAULT_VALUES,
}: UseInterestGroupWriteFormProps) =>
  useFormBuilder({
    schema: InterestGroupWriteSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      name: createTextInput({
        label: "Name",
        placeholder: "Fadderuka 2023",
        withAsterisk: true,
      }),
      description: createTextareaInput({
        label: "Description",
        withAsterisk: true,
        rows: 5,
      }),
    },
  });
