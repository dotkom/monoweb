import { ZodSchema } from "zod"

export class InvalidTemplateArguments extends Error {}

export function createTemplate<T>(validationSchema: ZodSchema<T>) {
  return (options: TemplateWithoutArguments<T>): TemplateDescription<T> => ({
    arguments: validationSchema,
    key: options.key,
    render: (data) => {
      const result = validationSchema.safeParse(data)
      if (!result.success) {
        throw new InvalidTemplateArguments("Invalid arguments passed to email template: " + result.error.message)
      }
      return options.render(result.data)
    },
  })
}

export type TemplateArguments<T> = T extends TemplateDescription<infer U> ? U : never
export type TemplateWithoutArguments<T> = Omit<TemplateDescription<T>, "arguments">
export type TemplateDescription<T> = {
  key: string
  arguments: ZodSchema<T>
  render: (options: T) => JSX.Element
}
