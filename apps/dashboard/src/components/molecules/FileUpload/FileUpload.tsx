"use client"
import type { Asset } from "@dotkomonline/types"
import { Anchor, Table } from "@mantine/core"
import type React from "react"
import { useUploadAssetToS3 } from "../../../modules/asset/mutations"
import { buildAssetUrl } from "../../../utils/s3"

interface FileTableProps {
  file: Asset
}
const FileTable = ({ file }: FileTableProps) => {
  const assetUrl = buildAssetUrl(file.id)
  return (
    <Table striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Navn</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr key={file.id}>
          <Table.Td>
            <Anchor href={assetUrl} target="_blank" rel="noreferrer">
              {file.originalFilename}
            </Anchor>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  )
}

interface Props {
  onChange: (image: Asset) => void
  value?: Asset
}

export default function FileUpload({ onChange, value }: Props) {
  const uploadToS3 = useUploadAssetToS3()

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("onSelectFile, e.target.files", e.target.files)
    if (e.target.files && e.target.files.length > 0) {
      const result = await uploadToS3(e.target.files[0])
      onChange(result)
    }
  }

  return (
    <div className="App">
      {value ? (
        <div>
          <FileTable file={value} />
        </div>
      ) : (
        <div className="Crop-Controls">
          <input type="file" onChange={onSelectFile} />
        </div>
      )}
    </div>
  )
}
