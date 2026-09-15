import { useState } from "react"
import { ImageInput } from "./ImageInput"

export default {
  title: "ImageInput",
}

export const Default = () => {
  const [value, setValue] = useState("")

  return (
    <ImageInput
      label="Bilde"
      value={value}
      onChange={setValue}
      onFileUpload={async () => "https://placehold.co/600x400"}
      maxSizeKiB={5 * 1024}
      acceptGif
    />
  )
}
