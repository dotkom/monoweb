import { SidequestStatusSchema, type SidequestRequestReviewWrite } from "@dotkomonline/rpc/sidequest"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "../../../components/forms/Form"
import { TextField } from "../../../components/forms/TextField"

const FormSchema = z.object({
  reviewNote: z.string().nullable(),
  approvedAmount: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), "Beløpet må være et heltall i kroner"),
})

type FormData = z.infer<typeof FormSchema>

interface Props {
  defaultValues: Partial<FormData>
  onSubmit: (data: SidequestRequestReviewWrite) => void
}

export const SidequestRequestReviewWriteForm = ({ defaultValues, onSubmit }: Props) => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  return (
    <Form
      form={form}
      onSubmit={(values) => {
        onSubmit({
          status: SidequestStatusSchema.enum.PUBLISHED,
          approvedAmount: values.approvedAmount !== "" ? Number(values.approvedAmount) : null,
          reviewNote: values.reviewNote ?? null,
        })
      }}
    >
      <TextField
        control={form.control}
        name="reviewNote"
        label="Notat til søker"
        placeholder="Skriv et notat til søkeren..."
      />
      <TextField
        control={form.control}
        name="approvedAmount"
        label="Godkjent beløp"
        description="La feltet stå tomt hvis det ikke innvilges støtte"
        type="number"
        placeholder="500"
      />
      <div className="flex flex-row gap-2">
        <Button type="submit" variant="default" className="w-fit">
          Godkjenn og publiser
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="w-fit"
          onClick={() => {
            onSubmit({
              status: SidequestStatusSchema.enum.REJECTED,
              reviewNote: form.getValues("reviewNote")?.trim() ?? null,
            })
          }}
        >
          Avvis
        </Button>
      </div>
    </Form>
  )
}
