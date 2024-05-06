"use client"

import type { Offline } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { formatDate } from "../../utils/format"
import { buildAssetUrl } from "../../utils/s3"

interface Props {
  data: Offline[]
}

export const useOfflineTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<Offline>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: () => "Tittel",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("published", {
        header: () => "Utgivelsesdato",
        cell: (info) => <Text>{formatDate(info.getValue())}</Text>,
      }),
      columnHelper.accessor("fileAssetKey", {
        header: () => "Fil",
        cell: (info) => {
          const assetKey = info.getValue()
          if (assetKey === null) {
            return "Ingen fil"
          }
          return (
            <Anchor target="_blank" href={buildAssetUrl(assetKey)} rel="noopenere">
              Link
            </Anchor>
          )
        },
      }),
      columnHelper.accessor("image", {
        header: () => "Bilde",
        cell: (info) => {
          const image = info.getValue()
          if (image === null) {
            return "Ingen bilde"
          }
          return (
            <Anchor target="_blank" href={buildAssetUrl(image.assetKey)} rel="noopenere">
              Link
            </Anchor>
          )
        },
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/offline/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
