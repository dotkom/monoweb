import "server-only"

import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/rpc"
import type { FeatureKey } from "@dotkomonline/rpc/feature"
import * as trpc from "@trpc/client"
import { unstable_cache } from "next/cache"
import superjson from "superjson"
import type { ZodType } from "zod"

const publicServer = trpc.createTRPCProxyClient<AppRouter>({
  links: [
    trpc.httpLink({
      transformer: superjson,
      url: `${env.RPC_HOST}/api/trpc`,
    }),
  ],
})

const getActiveFeatures = unstable_cache(() => publicServer.feature.active.query(), ["active-features"], {
  revalidate: 60,
  tags: ["features"],
})

async function getFeature(key: FeatureKey) {
  try {
    return (await getActiveFeatures()).find((feature) => feature.key === key)
  } catch (error) {
    console.error("Failed to fetch active features", error)
    return undefined
  }
}

export async function isFeatureActive(key: FeatureKey) {
  return (await getFeature(key)) !== undefined
}

export async function getFeatureConfiguration<T>(key: FeatureKey, schema: ZodType<T>) {
  const feature = await getFeature(key)
  const configuration = schema.safeParse(feature?.configuration)
  return configuration.success ? configuration.data : null
}
