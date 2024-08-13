import { useState } from "react"
import type { CursorPagination } from "../../../../../packages/core/src"
import { trpc } from "../../utils/trpc"

export const useFileAssetsAllQuery = () => {
  const [currentCursor, setCurrentCursor] = useState<CursorPagination.Cursor | undefined | null>(undefined)
  // TODO: const [prevCursor, setPrevCursor] = useState<CursorPagination.Cursor | undefined | null>(null)

  const { data, ...query } = trpc.asset.getAllFileAssets.useQuery({
    take: 1,
    cursor: currentCursor,
  })

  const nextPage = () => {
    setCurrentCursor(data?.next)
  }

  return {
    data: data?.data ?? [],
    hasNextPage: data?.next !== null,
    nextPage,
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
