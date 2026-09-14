import { useState } from "react"
import { TagInput } from "./TagInput"

export default {
  title: "TagInput",
}

export const Default = () => {
  const [tags, setTags] = useState<string[]>(["Kurs"])

  return (
    <TagInput
      data={["Arrangement", "Bedriftspresentasjon", "Kurs"]}
      value={tags}
      onChange={setTags}
      placeholder="Velg eller skriv inn en tag"
    />
  )
}
