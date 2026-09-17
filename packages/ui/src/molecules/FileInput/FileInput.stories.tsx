import { useState } from "react"
import { FileInput } from "./FileInput"

export default {
  title: "FileInput",
}

export const Default = () => {
  const [value, setValue] = useState<string | null>(null)

  return (
    <FileInput
      label="Fil"
      description="PDF for offline-utgaven"
      value={value}
      onChange={setValue}
      accept="application/pdf,.pdf,image/jpeg,.jpg"
      maxSizeKiB={10 * 1024}
      warnSizeKiB={5 * 1024}
      warnSizeDescription="Filen er over 5 MiB. En stor fil vil ta lang tid å laste inn for brukere. Prøv å gjøre den mindre før opplasting."
      onFileUpload={async (file) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return `https://cdn.example.com/${encodeURIComponent(file.name)}`
      }}
    />
  )
}

export const WithExistingUrl = () => {
  const [value, setValue] = useState<string | null>(null)

  return (
    <FileInput
      label="Fil"
      value={value}
      onChange={setValue}
      existingFileUrl="https://cdn.example.com/offline-49.pdf"
      onFileUpload={() => Promise.resolve("https://cdn.example.com/new-file.pdf")}
    />
  )
}
