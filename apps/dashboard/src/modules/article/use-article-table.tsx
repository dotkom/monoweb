"use client"

import type { Article } from "@dotkomonline/types"
import { Anchor, Group } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: Article[]
}

export const useArticleTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<Article>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: () => "Tittel",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("author", {
        header: () => "Forfatter",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("photographer", {
        header: () => "Fotograf",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("imageUrl", {
        header: () => "Bilde",
        cell: (info) => {
          const val = info.getValue()
          if (!val) {
            return "Ingen bilde"
          }

          return (
            <Anchor target="_blank" rel="noreferrer noopener" size="sm" href={info.getValue()}>
              Link
            </Anchor>
          )
        },
      }),
      columnHelper.accessor("isFeatured", {
        header: () => "Fremhevet",
        cell: (info) => (info.getValue() ? "Ja" : "Nei"),
      }),
      columnHelper.accessor("tags", {
        header: () => "Tags",
        cell: (info) => (
          <Group>
            {info.getValue().map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </Group>
        ),
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/article/${info.getValue().id}`}>
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
