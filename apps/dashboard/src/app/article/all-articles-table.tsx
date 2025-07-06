import { FilterableTable, arrayOrEqualsFilter } from "@/components/molecules/FilterableTable/FilterableTable"
import type { Article } from "@dotkomonline/types"
import { Anchor, Group } from "@mantine/core"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface AllArticlesTableProps {
  articles: Article[]
}

export const AllArticlesTable = ({ articles }: AllArticlesTableProps) => {
  const columnHelper = createColumnHelper<Article>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((article) => article.title, {
        id: "title",
        header: () => "Tittel",
        sortingFn: "alphanumeric",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/article/${info.row.original.id}`}>
            {info.getValue()}
          </Anchor>
        ),
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
            <Anchor target="_blank" rel="noreferrer noopener" size="sm" href={info.getValue()}>
              Link
            </Anchor>
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
          <Group>
            {info.row.original.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </Group>
        ),
      }),
    ],
    [columnHelper]
  )

  const tableOptions = useMemo(
    () => ({
      data: articles,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [articles, columns]
  )

  return (
    <FilterableTable
      tableOptions={tableOptions}
      filters={[
        { columnId: "isFeatured", label: "Fremhevet", value: true },
        { columnId: "isFeatured", label: "Ikke fremhevet", value: false },
      ]}
    />
  )
}
