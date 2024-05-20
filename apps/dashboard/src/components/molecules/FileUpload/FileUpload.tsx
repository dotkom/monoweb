"use client"
import { Anchor, Box } from "@mantine/core"
import type React from "react"
import { useUploadAssetToS3 } from "../../../modules/asset/mutations"
import { buildAssetUrl } from "../../../utils/s3"

interface Props {
  onFileLoad: (image: string) => void
  value?: string
}

export default function FileUpload({ onFileLoad, value }: Props) {
  const uploadToS3 = useUploadAssetToS3()

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const result = await uploadToS3(e.target.files[0])
      onFileLoad(result.key)
    }
  }

  return (
    <div className="App">
      <Box mb={"sm"}>
        <input type="file" onChange={onSelectFile} />
      </Box>
      {!!value && (
        <Anchor href={buildAssetUrl(value)} target="_blank">
          {value}
        </Anchor>
      )}
    </div>
  )
}
