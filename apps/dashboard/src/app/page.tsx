"use client"
import { z } from "zod"
import { trpc } from "../utils/trpc"
import { createImageInput, useFormBuilder } from "./form"
import { type Image, ImageSchema } from "@dotkomonline/types"

const FormValidationSchema = z.object({
  image: ImageSchema,
  fileId: z.string(),
})
type FormValidationSchema = z.infer<typeof FormValidationSchema>

interface FormProps {
  image: Image
}
function Form2({ image }: FormProps) {
  const Form = useFormBuilder({
    schema: FormValidationSchema,
    label: "Last opp bilde",
    defaultValues: {
      image: image,
    },
    fields: {
      image: createImageInput({
        label: "Bilde",
        placeholder: "Last opp",
      }),
    },
    onSubmit: async (data) => {
      console.log("submitting form", data)
    },
  })

  return <Form />
}

export default function DashboardPage() {
  const { data: image, isLoading } = trpc.asset.getImage.useQuery("01HX4R9550BMMCRZ9SPK3416CP")

  if(!image) return <p>Loading!</p>

  return isLoading ? <p>Loading...</p> : <Form2 image={image} />
}