import { useState } from "react"
import { RichTextInput } from "./RichTextInput"

export default {
  title: "RichTextInput",
}

export const Default = () => {
  const [value, setValue] = useState("<p>Skriv her…</p>")

  return (
    <RichTextInput
      value={value}
      onChange={setValue}
      onFileUpload={() => Promise.resolve("https://placehold.co/600x400")}
    />
  )
}

export const WithoutImageUpload = () => {
  const [value, setValue] = useState("")

  return <RichTextInput value={value} onChange={setValue} />
}
