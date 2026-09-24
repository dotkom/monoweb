"use client"

import { Button, Title } from "@dotkomonline/ui"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CreateMarkModal } from "./CreateMarkModal"
import { CreateSuspensionModal } from "./CreateSuspensionModal"
import { MarkTable } from "./MarkTable"
import { useMarkFindManyInfiniteQuery } from "./queries"

type PageModalState = "mark" | "suspension"

export default function MarkPage() {
  const { marks, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useMarkFindManyInfiniteQuery()
  const [modal, setModal] = useState<PageModalState | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const createSearchParam = searchParams.get("create")

  useEffect(() => {
    if (createSearchParam === "prikk") {
      setModal("mark")
    } else if (createSearchParam === "suspensjon") {
      setModal("suspension")
    } else {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete("create")
    const qs = params.toString()

    router.replace(qs ? `/prikker?${qs}` : "/prikker")
  }, [createSearchParam, router, searchParams])

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Prikker
      </Title>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="default" size="lg" onClick={() => setModal("mark")}>
            Gi ny prikk
          </Button>
          <Button variant="default" size="lg" onClick={() => setModal("suspension")}>
            Gi ny suspensjon
          </Button>
        </div>

        <MarkTable
          marks={marks}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>

      <CreateMarkModal
        open={modal === "mark"}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null)
          }
        }}
      />
      <CreateSuspensionModal
        open={modal === "suspension"}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null)
          }
        }}
      />
    </div>
  )
}
