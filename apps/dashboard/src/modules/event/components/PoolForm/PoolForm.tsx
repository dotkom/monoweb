import { type AttendancePool } from "@dotkomonline/types";
import { Box, Button } from "@mantine/core";
import { type FC } from "react";
import { z } from "zod";
import { validateAndReturn } from "./utils";
import {
  createLabelledCheckboxGroupInput,
  createNumberInput,
  useFormBuilder,
} from "../../../../app/form";
import { notifyFail } from "../../../../app/notifications";

export interface PoolFormProps {
  onSubmit(values: PoolFormSchema): void;
  attendancePools: AttendancePool[];
  onClose(): void;
  defaultValues: PoolFormSchema;
  mode: "create" | "update";
}

export const PoolFormSchema = z.object({
  yearCriteria: z.array(z.number()),
  limit: z.number(),
});
export type PoolFormSchema = z.infer<typeof PoolFormSchema>;

export const usePoolFormLogic = (props: PoolFormProps) => {
  const existingPools = [
    ...new Set(
      props.attendancePools.flatMap(({ yearCriteria }) => yearCriteria)
    ),
  ];

  const yearLabels = [
    "sosialt",
    "1. klasse",
    "2. klasse",
    "3. klasse",
    "4. klasse",
    "5. klasse",
  ];

  const Form = useFormBuilder({
    schema: PoolFormSchema,
    defaultValues: props.defaultValues,
    fields: {
      yearCriteria: createLabelledCheckboxGroupInput({
        disabledOptions: existingPools,
        labels: yearLabels,
      }),
      limit: createNumberInput({
        label: "Kapasitet1",
      }),
    },
    label: props.mode === "create" ? "Opprett pulje" : "Endre pulje",
    onSubmit: (values, form) => {
      form.resetField("yearCriteria");
      try {
        validateAndReturn(values.yearCriteria);
        props.onSubmit(values);
      } catch (e) {
        notifyFail({
          title: "Oops!",
          message: (e as Error).message,
        });
      }
    },
  });

  return { Form };
};
export const PoolForm: FC<PoolFormProps> = (props) => {
  const { Form } = usePoolFormLogic(props);

  return (
    <Box>
      <Form />
      <Button onClick={props.onClose} mt={16} color="gray">
        Lukk
      </Button>
    </Box>
  );
};
