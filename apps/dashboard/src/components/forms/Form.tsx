import { zodResolver } from "@/lib/zod-resolver"
import { Button, Flex } from "@mantine/core"
import { useCallback, useRef } from "react"
import { type DefaultValues, type FieldPath, type FieldValue, type UseFormReturn, useForm } from "react-hook-form"
import type { z } from "zod"
import type { InputProducerResult } from "./types"

function entriesOf<T extends Record<string, unknown>, K extends string & keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][]
}

interface FormBuilderOptions<T extends z.ZodRawShape> {
  schema: z.ZodObject<T>
  fields: Partial<{
    [K in keyof z.input<z.ZodObject<T>>]: InputProducerResult<z.input<z.ZodObject<T>>, z.output<z.ZodObject<T>>>
  }>
  defaultValues?: DefaultValues<z.input<z.ZodObject<T>>>
  label: string
  onSubmit(
    data: z.output<z.ZodObject<T>>,
    form: UseFormReturn<z.input<z.ZodObject<T>>, unknown, z.output<z.ZodObject<T>>>
  ): void
  disabled?: boolean
}

export function useFormBuilder<T extends z.ZodRawShape>({
  schema,
  fields,
  defaultValues,
  label,
  onSubmit,
  disabled,
}: FormBuilderOptions<T>) {
  type FormInput = z.input<z.ZodObject<T>>
  type FormOutput = z.output<z.ZodObject<T>>

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  })

  const components = entriesOf(fields).map(([name, fc]) => {
    if (!fc) {
      throw new Error()
    }

    const Component: InputProducerResult<FormInput, FormOutput> = fc

    // zod v4's $InferObjectOutput<T> is opaque in generics. FieldPath<T> cannot index DeepPartial<T> without this cast
    const defaultValue = (form.formState.defaultValues as Record<string, unknown>)?.[
      name as string
    ] as FieldValue<FormInput>

    return (
      <Component
        defaultValue={defaultValue}
        key={name}
        name={name as FieldPath<FormInput>}
        register={form.register}
        control={form.control}
        state={form.formState}
        setValue={form.setValue}
        getValues={form.getValues}
        setError={form.setError}
        clearErrors={form.clearErrors}
        disabled={disabled}
      />
    )
  })

  const formComponentConfigurationReference = useRef({
    components,
    disabled,
    form,
    label,
    onSubmit,
  })

  formComponentConfigurationReference.current = {
    components,
    disabled,
    form,
    label,
    onSubmit,
  }

  return useCallback(function Form() {
    const configuration = formComponentConfigurationReference.current

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          return configuration.form.handleSubmit((values) => {
            return configuration.onSubmit(values, configuration.form)
          })(e)
        }}
      >
        <Flex direction="column" gap="md">
          {configuration.components}
          <div>
            <Button type="submit" disabled={configuration.disabled}>
              {configuration.label}
            </Button>
          </div>
        </Flex>
      </form>
    )
  }, [])
}
