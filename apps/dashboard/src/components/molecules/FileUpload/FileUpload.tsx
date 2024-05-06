"use client"
import type React from "react"
import { useUploadAssetToS3 } from "../../../modules/asset/mutations"
import { Anchor } from "@mantine/core"
import { buildAssetUrl } from "../../../utils/s3"

interface Props {
  onChange: (image: string) => void
  value?: string
}

export default function FileUpload({ onChange, value }: Props) {
  console.log(value)
  const uploadToS3 = useUploadAssetToS3()

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("onSelectFile, e.target.files", e.target.files)
    if (e.target.files && e.target.files.length > 0) {
      const result = await uploadToS3(e.target.files[0])
      onChange(result.id)
    }
  }

  return (
    <div className="App">
      <div className="Crop-Controls">
        <input type="file" onChange={onSelectFile} />
      </div>
      {!!value && (
        <Anchor href={buildAssetUrl(value)} target="_blank">
          {value}
        </Anchor>
      )}
    </div>
  )
}
