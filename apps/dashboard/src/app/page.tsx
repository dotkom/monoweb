"use client"
import { ImageSchema } from "@dotkomonline/types"
import { z } from "zod"
import { createImageInput, useFormBuilder } from "./form"

const FormValidationSchema = z.object({
  image: ImageSchema,
  fileId: z.string(),
})
type FormValidationSchema = z.infer<typeof FormValidationSchema>

export default function DashboardPage() {
  const Form = useFormBuilder({
    schema: FormValidationSchema,
    label: "Last opp bilde",
    defaultValues: {
      image: {
        id: "01HX4CPYMNFNYDKNZ2WW7SEKA3",
        crop: {
          left: 21,
          top: 129,
          width: 335,
          height: 232,
        },
        assetId:
          "00d9565a-d6be-4b3e-bede-89957ca43f0chei.png30d674cb-e251-49a7-9cc1-81d857a712ce",
      }
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

  return (
    <Form />
  )
}


// https://s3.eu-north-1.amazonaws.com/cdn.staging.online.ntnu.no/testing/testing/Screenshot%202023-06-25%20at%2012.43.43.png578d7818-88be-4087-a428-32c89a3cf994

// {
//   "id": "01HX2ERFQH8GGRVPGVJ8ZYCYMM",
//   "createdAt": "2024-05-04T18:44:44.357Z",
//   "assetUri": "78786155-af3e-43d4-bf7c-35ae183d792ehei.png1b16623e-fc87-4ca2-930a-048454269d25",
//   "crop": {
//       "x": 46.414062499999936,
//       "y": 317.6171875,
//       "width": 421.984375,
//       "height": 237.4609375,
//       "unit": "px"
//   }
// }

// https://onli.no/cdn-cgi/image/trim=1000;0;0;0/https://s3.eu-north-1.amazonaws.com/cdn.staging.online.ntnu.no/testing/78786155-af3e-43d4-bf7c-35ae183d792ehei.png1b16623e-fc87-4ca2-930a-048454269d25
