import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Flex } from "@mantine/core"
import { DeepPartial, type DefaultValues, FieldName, FieldValue, Path, type UseFormReturn, useForm } from "react-hook-form"
import type { z } from "zod"
import type { InputProducerResult } from "./types"

function entriesOf<T extends Record<string, unknown>, K extends string & keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][]
}

interface FormBuilderOptions<T extends z.ZodObject> {
  schema: T | z.ZodType<T>
  fields: Partial<{
    [K in keyof z.infer<T>]: InputProducerResult<z.infer<T>>
  }>
  defaultValues?: DefaultValues<z.infer<T>>
  label: string
  onSubmit(data: z.infer<T>, form: UseFormReturn<z.infer<T>>): void
  disabled?: boolean
}

export function useFormBuilder<T extends z.ZodObject>({
  schema,
  fields,
  defaultValues,
  label,
  onSubmit,
  disabled,
}: FormBuilderOptions<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  })
  const components = entriesOf(fields).map(([name, fc]) => {
    if (!fc) {
      throw new Error()
    }
    const Component: InputProducerResult<z.infer<T>> = fc
    return (
      <Component
        defaultValue={form.formState.defaultValues?.[name] as FieldValue<z.infer<T>> | undefined}
        key={name}
        name={name as Path<z.infer<T>>}
        register={form.register}
        control={form.control}
        state={form.formState}
      />
    )
  })

  return function Form() {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          return form.handleSubmit((values) => {
            return onSubmit(values, form)
          })(e)
        }}
      >
        <Flex direction="column" gap="md">
          {components}
          <div>
            <Button type="submit" disabled={disabled}>
              {label}
            </Button>
          </div>
        </Flex>
      </form>
    )
  }
}
