"use client"

import { Box } from "@mantine/core"
import { z } from "zod"
import { createImageInput, createTextInput, useFormBuilder } from "./form"

export function TestComp() {
  const Form = useFormBuilder({
    schema: z.object({
      image: z.any(),
      name: z.string(),
    }),
    label: "Upload image",
    onSubmit: (values) => {
      console.log(values)
    },
    fields: {
      name: createTextInput({
        label: "Name",
      }),
      image: createImageInput({
        label: "Image",
        aspect: undefined,
        currentFile: {
          id: "1",
          fileName: "Moppe",
          url: "https://www.clasohlson.com/no/Hjem/Vaske-og-rydde/Mopper-og-b%C3%B8tter/c/1457",
          fileType: "image/jpeg",
          createdAt: new Date(),
        },
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
