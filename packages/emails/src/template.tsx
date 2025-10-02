import { render } from "@react-email/render"
import type { FC } from "react"
import type { z } from "zod"

export class InvalidTemplateArguments extends Error {}

export interface Template<T extends Record<string, unknown>> {
  (args: z.infer<z.ZodJSONSchema<T>>): Promise<string>
  displayName: string
}

export function createTemplate<T extends Record<string, unknown>>(
  name: string,
  schema: z.ZodJSONSchema<T>,
  Component: FC<z.infer<typeof schema>>
): Template<T> {
  const handler = async (args: z.infer<typeof schema>) => {
    const result = schema.safeParse(args)
    if (!result.success) {
      throw new InvalidTemplateArguments(`Invalid arguments passed to email template: ${result.error.message}`)
    }
    return await render(<Component {...args} />)
  }
  handler.displayName = name
  return handler
}

export type TemplateProps<S extends z.ZodJSONSchema> = z.infer<S>
