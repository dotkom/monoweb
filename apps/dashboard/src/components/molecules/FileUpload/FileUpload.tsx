"use client"
import type { FileAsset } from "@dotkomonline/types"
import { Anchor, Box, Text } from "@mantine/core"
import type React from "react"
import type { ReactNode } from "react"
import { useUploadFileAssetToS3 } from "../../../modules/asset/mutations"
import { buildAssetUrl } from "../../../utils/s3"

interface Props {
  onFileLoad: (image: string) => void
  value: FileAsset
  error?: ReactNode
}

export default function FileUpload({ onFileLoad, value, error }: Props) {
  const uploadToS3 = useUploadFileAssetToS3()

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
        {error && (
          <Text c="red" mt="sm">
            {error}
          </Text>
        )}
      </Box>
      {!!value && (
        <Anchor href={buildAssetUrl(value.key)} target="_blank">
          {value.originalFilename}
        </Anchor>
      )}
    </div>
  )
}
