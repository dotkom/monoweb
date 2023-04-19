import { ZodSchema } from "zod"
import { render } from "@react-email/render"

export class InvalidTemplateArguments extends Error {}

export function createTemplate<T>(validationSchema: ZodSchema<T>) {
  return (options: TemplateOptions<T>): TemplateDescription<T> => ({
    arguments: validationSchema,
    key: options.key,
    render: (data) => {
      const result = validationSchema.safeParse(data)
      if (!result.success) {
        throw new InvalidTemplateArguments("Invalid arguments passed to email template: " + result.error.message)
      }
      const jsx = options.render(result.data)
      return render(jsx)
    },
  })
}

export type TemplateArguments<T> = T extends TemplateDescription<infer U> ? U : never
export type TemplateOptions<T> = {
  render: (options: T) => JSX.Element
} & Pick<TemplateDescription<T>, "key">
export type TemplateDescription<T> = {
  key: string
  arguments: ZodSchema<T>
  render: (options: T) => string
}
