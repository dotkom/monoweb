"use client"
import type { FileAsset } from "@dotkomonline/types"
import type { ReactNode } from "react"
import { usePickFileAssetModal } from "../../../modules/asset/modals"

interface Props {
  setFileAsset: (file: FileAsset | null) => void
  fileAsset: FileAsset
  error?: ReactNode
}

export default function FileAssetInput({ setFileAsset, fileAsset, error }: Props) {
  const openPickFileAsset = usePickFileAssetModal()
  const onSelected = (file: FileAsset) => {
    setFileAsset(file)
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!fileAsset && (
          <button onClick={() =>  openPickFileAsset(onSelected)} type="button">
            Velg fra galleri
          </button>
      )}
      {fileAsset && (
        <div>
          <div>{fileAsset.title}</div>
          <div>{fileAsset.originalFilename}</div>
        </div>
       )}
    </div>
  )
}
