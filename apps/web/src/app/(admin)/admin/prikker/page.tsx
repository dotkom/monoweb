"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { canCreateMarks } from "@dotkomonline/rpc/mark-permissions"
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
  const authorization = useAuthorization()
  const canCreate = canCreateMarks(authorization)

  const router = useRouter()
  const searchParams = useSearchParams()
  const createSearchParam = searchParams.get("create")

  useEffect(() => {
    if (!canCreate) {
      return
    }

    if (createSearchParam === "prikk") {
      setModal("mark")
    } else if (createSearchParam === "suspensjon") {
      setModal("suspension")
    } else {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.delete("create")
    const queryString = params.toString()

    router.replace(queryString ? `/admin/prikker?${queryString}` : "/admin/prikker")
  }, [canCreate, createSearchParam, router, searchParams])

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Prikker
      </Title>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <PermissionTooltip allowed={canCreate}>
            <Button variant="default" size="lg" onClick={() => setModal("mark")} disabled={!canCreate}>
              Gi ny prikk
            </Button>
          </PermissionTooltip>
          <PermissionTooltip allowed={canCreate}>
            <Button variant="default" size="lg" onClick={() => setModal("suspension")} disabled={!canCreate}>
              Gi ny suspensjon
            </Button>
          </PermissionTooltip>
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
