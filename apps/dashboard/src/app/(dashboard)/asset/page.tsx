"use client"

import { Anchor, Box, Table, Title } from "@mantine/core"
import { useFileAssetsAllQuery, useImageAssetsAllQuery } from "../../../modules/asset/queries"
import { buildAssetUrl } from "../../../utils/s3"

export default function AssetPage() {
  const { fileAssets, isLoading: isFileAssetsLoading } = useFileAssetsAllQuery()
  const { imageAssets, isLoading: isImageAssetsLoading } = useImageAssetsAllQuery()

  return (
    <div>
      <Box>
        <Title order={3}>Bilder</Title>
        {imageAssets.map((fileAsset) => (
          <Table key={fileAsset.key} striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Navn</Table.Th>
                <Table.Th>Link</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>{fileAsset.originalFilename}</Table.Td>
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
      <Box mt={"xl"}>
      <Title order={3}>Andre filer</Title>
        {fileAssets.map((fileAsset) => (
          <Table key={fileAsset.key} striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Navn</Table.Th>
                <Table.Th>Link</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>{fileAsset.originalFilename}</Table.Td>
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
