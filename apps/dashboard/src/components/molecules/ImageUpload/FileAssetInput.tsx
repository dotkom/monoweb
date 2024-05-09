"use client"
import type { FileAsset } from "@dotkomonline/types"
import { useDisclosure } from "@mantine/hooks"
import type { ReactNode } from "react"
import { FileAssetFromGalleryInput } from "../../../modules/asset/modals"

interface Props {
  setFileAsset: (file: FileAsset | null) => void
  fileAsset: FileAsset
  error?: ReactNode
}

export default function FileAssetInput({ setFileAsset, fileAsset, error }: Props) {
  const [showGallery, { toggle, close }] = useDisclosure()
  const onSelected = (file: FileAsset) => {
    console.log("onSelected", file)
    setFileAsset(file)
    close()
  }

  console.log("render FileAssetInput", fileAsset)

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!fileAsset && (
        <button onClick={() => toggle()} type="button">
          Velg fra galleri
        </button>
      )}
      {showGallery && <FileAssetFromGalleryInput onSelect={onSelected} />}

      {fileAsset && (
        <div>
          <div>{fileAsset.title}</div>
          <div>{fileAsset.originalFilename}</div>
        </div>
      )}
    </div>
  )
}
