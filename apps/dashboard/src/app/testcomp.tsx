"use client"

import { Box } from "@mantine/core"
import { z } from "zod"
import { createImageInput, useFormBuilder } from "./form"

export function TestComp() {
  const Form = useFormBuilder({
    schema: z.object({
      image: z.any(),
    }),
    label: "Upload image",
    onSubmit: (values) => {
      console.log("ONSUBMIT", values)
    },
    fields: {
      image: createImageInput({
        label: "Image",
        aspect: undefined,
      }),
    },
  })
  return (
    <Box w={"500px"} mx={"auto"}>
      {" "}
      <Form />{" "}
    </Box>
  )
}
