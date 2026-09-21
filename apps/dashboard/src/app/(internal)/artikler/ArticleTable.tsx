"use client"

import { DataTable } from "@/components/DataTable"
import { arrayOrEqualsFilter } from "@/components/FilterableDataTable"
import type { Article } from "@dotkomonline/rpc/article"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"

interface Props {
  articles: Article[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

const columnHelper = createColumnHelper<Article>()

export const ArticleTable = ({
  articles,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const columns = [
    columnHelper.accessor((article) => article.title, {
      id: "title",
      header: () => "Tittel",
      sortingFn: "alphanumeric",
      cell: (info) => <TextLink href={`/artikler/${info.row.original.slug}`}>{info.getValue()}</TextLink>,
    }),
    columnHelper.accessor("author", {
      header: () => "Forfatter",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("photographer", {
      header: () => "Fotograf",
      cell: (info) => info.getValue(),
      sortingFn: "alphanumeric",
    }),
    columnHelper.accessor("imageUrl", {
      header: () => "Bilde",
      enableSorting: false,
      cell: (info) => {
        const val = info.getValue()
        if (!val) {
          return "Ingen bilde"
        }

        return (
          <TextLink target="_blank" rel="noreferrer noopener" href={info.getValue()}>
            Link
          </TextLink>
        )
      },
    }),
    columnHelper.accessor("isFeatured", {
      header: () => "Fremhevet",
      cell: (info) => (info.getValue() ? "Ja" : "Nei"),
      filterFn: arrayOrEqualsFilter<Article>(),
    }),
    columnHelper.accessor((article) => article.tags.join(" "), {
      id: "Tags",
      header: () => "Tags",
      cell: (info) => (
        <div className="flex flex-row items-center flex-wrap gap-2">
          {info.row.original.tags.map((tag) => (
            <span key={tag.name}>{tag.name}</span>
          ))}
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: articles,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
