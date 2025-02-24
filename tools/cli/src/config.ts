import { z } from "zod"
import * as rawConfig from "../config.json"

const ConfigSchema = z.object({
  cluster: z.string().min(1, "missing AWS ECS cluster name"),
})

export const config = ConfigSchema.parse(rawConfig)
