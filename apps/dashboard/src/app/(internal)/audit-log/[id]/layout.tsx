"use client"

import { PropsWithChildren, use, useMemo } from "react"
import { AuditLogDetailsContext } from "./provider"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc-client";
import { Loader } from "@mantine/core";

export default function AuditLogDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC();
  const { id } = use(params)
  const { data, isLoading } = useQuery(trpc.auditLog.getById.queryOptions(id))

    const value = useMemo(
      () =>
        !data || isLoading
          ? null
          : {
              auditLog: data,
            },
      [data, isLoading]
    )
  
    if (value === null) {
      return <Loader />
    }
    
  return (
    <AuditLogDetailsContext.Provider value={value}>
      {children}

    </AuditLogDetailsContext.Provider>
  )
}
