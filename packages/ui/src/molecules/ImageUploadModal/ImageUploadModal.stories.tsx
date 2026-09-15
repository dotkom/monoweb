import { useState } from "react"
import { ImageUploadModal } from "./ImageUploadModal"

export default {
  title: "ImageUploadModal",
}

export const Default = () => {
  const [open, setOpen] = useState(true)

  return (
    <ImageUploadModal
      open={open}
      onOpenChange={setOpen}
      onSubmit={() => setOpen(false)}
      onFileUpload={() => Promise.resolve("https://placehold.co/600x400")}
    />
  )
}
