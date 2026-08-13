import { buildLimitedDepthJsonSchema } from "@dotkomonline/utils"
import { z } from "zod"

export const FeatureKeySchema = z.enum(["fadderuke-2026-notice", "front-page-notice"])

export type FeatureKey = z.infer<typeof FeatureKeySchema>

export const FeatureConfigurationSchema = buildLimitedDepthJsonSchema().refine(
  (value) => value !== null && typeof value === "object" && !Array.isArray(value),
  "Feature configuration must be a JSON object"
)

export const FeatureSchema = z.object({
  key: FeatureKeySchema,
  enabled: z.boolean(),
  startsAt: z.date().nullable(),
  endsAt: z.date().nullable(),
  configuration: FeatureConfigurationSchema,
  updatedAt: z.date(),
})

export type Feature = z.infer<typeof FeatureSchema>

export const FeatureWriteSchema = FeatureSchema.pick({
  key: true,
  enabled: true,
  startsAt: true,
  endsAt: true,
  configuration: true,
}).superRefine((feature, ctx) => {
  if (feature.startsAt && feature.endsAt && feature.startsAt > feature.endsAt) {
    ctx.addIssue({ code: "custom", message: "Feature start must be before its end", path: ["endsAt"] })
  }

  if (feature.key === "front-page-notice") {
    const result = z.object({ text: z.string() }).safeParse(feature.configuration)
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: 'Notice configuration must contain a string field named "text"' })
    }
  }
})

export type FeatureWrite = z.infer<typeof FeatureWriteSchema>

export const FrontPageNoticeConfigurationSchema = z.object({ text: z.string() })
