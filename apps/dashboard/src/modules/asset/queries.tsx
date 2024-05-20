import { useState } from "react"
import type { CursorPagination } from "../../../../../packages/core/src"
import { trpc } from "../../utils/trpc"

export const useFileAssetsAllQuery = () => {
  const [cursor, setCursor] = useState<CursorPagination.Cursor | undefined>(undefined)
  const [nextCursor, setNextCursor] = useState<CursorPagination.Cursor | undefined>(undefined)

  const { data, ...query } = trpc.asset.getAllFileAssets.useQuery({
    take: 10,
    cursor,
  })

  return {
    data: data?.data ?? [],
    hasMore: data?.next !== null,
    ...query,
  }
}

export const useImageAssetsAllQuery = (cursor?: CursorPagination.Cursor) => {
  const { data, ...query } = trpc.asset.getAllImageAssets.useQuery({
    take: 10,
    cursor,
  })

  return {
    data: data?.data ?? [],
    next: data?.next,
    ...query,
  }
}
