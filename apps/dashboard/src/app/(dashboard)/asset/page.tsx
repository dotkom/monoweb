"use client"

import { Anchor, Box, Button, Table, Title } from "@mantine/core"
import {
  useCreateFileAssetModal,
  useCreateImageAssetModal,
  useUpdateImageAssetModal,
} from "../../../modules/asset/modals"
import { useFileAssetsAllQuery } from "../../../modules/asset/queries"
import { buildAssetUrl } from "../../../utils/s3"

export default function AssetPage() {
  const { data, hasNextPage, isLoading, nextPage } = useFileAssetsAllQuery()
  // const { data: imageAssets, next: imageAssetsNext, isLoading: isImageAssetsLoading } = useImageAssetsAllQuery()
  const openFileUploadModal = useCreateFileAssetModal()
  const openImageUploadModal = useCreateImageAssetModal()
  const openUpdateImageModal = useUpdateImageAssetModal()

  return (
    <div>
      <button type="button" onClick={nextPage}>Next</button>
      <Box>
        <Title order={3}>Bilder</Title>
        <Button onClick={openImageUploadModal}>Last opp bilde</Button>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Navn</Table.Th>
              <Table.Th>Dimensjoner</Table.Th>
              <Table.Th>Størrelse</Table.Th>
              <Table.Th>Detaljer</Table.Th>
            </Table.Tr>
          </Table.Thead>
          {/* <Table.Tbody>
            {imageAssets.map((fileAsset) => (
              <Table.Tr key={fileAsset.key}>
                <Table.Td>
                  <Anchor href={buildAssetUrl(fileAsset.key)} target="_blank">
                    {fileAsset.originalFilename}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  {fileAsset.width}x{fileAsset.height}
                </Table.Td>
                <Table.Td>{fileAsset.size / 1000} kB</Table.Td>
                <Table.Td>
                  <Button size="xs" onClick={() => openUpdateImageModal(fileAsset)}>
                    Rediger
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody> */}
        </Table>
      </Box>
      <Box mt={"xl"}>
        <Title order={3}>Andre filer</Title>
        <Button onClick={openFileUploadModal}>Last opp fil</Button>

        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Navn</Table.Th>
              <Table.Th>Opprettet</Table.Th>
              <Table.Th>Størrelse</Table.Th>
              <Table.Th>Link</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((fileAsset) => (
              <Table.Tr key={fileAsset.key}>
                <Table.Td>{fileAsset.originalFilename}</Table.Td>
                <Table.Td>{fileAsset.createdAt.toString()}</Table.Td>
                <Table.Td>{fileAsset.size / 1000} kB</Table.Td>
                <Table.Td>
                  <Anchor href={buildAssetUrl(fileAsset.key)} target="_blank">
                    Open
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </div>
  )
}
