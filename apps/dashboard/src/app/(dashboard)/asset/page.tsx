"use client"

import { Anchor, Box, Table, Title } from "@mantine/core"
import { useFileAssetsAllQuery, useImageAssetsAllQuery } from "../../../modules/asset/queries"
import { buildAssetUrl } from "../../../utils/s3"
import ImageUpload from "../../../components/molecules/ImageUpload/ImageUpload"
import { FileAssetSchema, FileAssetWriteSchema, ImageAssetWriteSchema, type FileAsset, type ImageVariant } from "@dotkomonline/types"
import { useState } from "react"
import FileUpload from "../../../components/molecules/FileUpload/FileUpload"
import { createFileInput, createMultipleSelectInput, createTextareaInput, createTextInput, useFormBuilder } from "../../form"
import { z } from "zod"

export default function AssetPage() {
  const { fileAssets, isLoading: isFileAssetsLoading } = useFileAssetsAllQuery()
  const { imageAssets, isLoading: isImageAssetsLoading } = useImageAssetsAllQuery()
  const [imageVariant, setImageVariant] = useState<ImageVariant | null>(null)
  const [fileAsset, setFileAsset] = useState<FileAsset | null>(null)

  const ImageAssetForm = useFormBuilder({
    label: "Last opp nytt bilde",
    onSubmit: async (values) => {
      console.log(values)
    },
    schema: ImageAssetWriteSchema,
      fields: {
      key: createFileInput({
        label: "Fil",
        placeholder: "Last opp",
        required: true,
      }),
      title: createTextInput({
        label: "Tittel",
        placeholder: "Tittel",
        required: true,
      }),
      altText: createTextareaInput({
        label: "Alt-tekst",
        placeholder: "Beskrivelse av bildet",
        required: true,
      }),
      photographer: createTextInput({
        label: "Fotograf",
        placeholder: "Fotograf",
        required: false,
      }),
      tags: createMultipleSelectInput({
        label: "Tags",
        placeholder: "Tags",
        required: false,
      }),
    },
  })

  const FileAssetForm = useFormBuilder({
    label: "Last opp ny fil",
    onSubmit: async (values) => {
      console.log(values)
    },
    schema: z.object({
      file: FileAssetSchema,
      tags: z.array(z.string()),
    }),
    fields: {
      file: createFileInput({
        label: "Fil",
        placeholder: "Last opp",
        required: true,
      }),
      tags: createMultipleSelectInput({
        label: "Tags",
        placeholder: "Tags",
        required: false,
      }),
    },
  })

  return (
    <div>
      <Box>
        <Title order={3}>Bilder</Title>
        <ImageUpload setImageVariant={setImageVariant} imageVariant={imageVariant} />
        <ImageAssetForm />
        {imageAssets.map((fileAsset) => (
          <Table key={fileAsset.key} striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Navn</Table.Th>
                <Table.Th>Opprettet</Table.Th>
                <Table.Th>Dimensjoner</Table.Th>
                <Table.Th>Størrelse</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Anchor href={buildAssetUrl(fileAsset.key)} target="_blank">
                  {fileAsset.originalFilename}
                  </Anchor>
                </Table.Td>
                <Table.Td>{fileAsset.createdAt.toString()}</Table.Td>
                <Table.Td>{fileAsset.width}x{fileAsset.height}</Table.Td>
                <Table.Td>{fileAsset.size / 1000} kB</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table> 
        ))}

      </Box>
      <Box mt={"xl"}>
      <Title order={3}>Andre filer</Title>
      <FileUpload value={fileAsset} onFileLoad={setFileAsset} />
        {fileAssets.map((fileAsset) => (
          <Table key={fileAsset.key} striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Navn</Table.Th>
                <Table.Th>Opprettet</Table.Th>
                <Table.Th>Størrelse</Table.Th>
                <Table.Th>Link</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>{fileAsset.originalFilename}</Table.Td>
                <Table.Td>{fileAsset.createdAt.toString()}</Table.Td>
                <Table.Td>{fileAsset.size / 1000} kB</Table.Td>
                <Table.Td>
                  <Anchor href={buildAssetUrl(fileAsset.key)} target="_blank">
                    Open
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table> 
        ))}
      </Box>
    </div>
  )
}
