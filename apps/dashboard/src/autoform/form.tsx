import { z } from "zod"
import {
  DeepPartial,
  FieldErrors,
  useForm,
  UseFormRegisterReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { ComponentPropsWithoutRef, FC } from "react";
import { AutoFormTextInput } from "./components"

type FormComponentMapping = readonly [z.ZodType, FC<UseFormRegisterReturn & {
  errors: FieldErrors
}>][]

export const ComponentMapping = [
  [z.string(), AutoFormTextInput]
] satisfies FormComponentMapping

type AutoFormOptions<M extends FormComponentMapping, T extends z.ZodRawShape, TOut extends z.infer<z.ZodObject<T>>> = {
  schema: z.ZodObject<T>
  onFormSubmit: (data: TOut) => void
  defaultValues?: DeepPartial<TOut>
  mapping: M
  props: DeepPartial<{
    [K in keyof T]: DeepPartial<ComponentPropsWithoutRef<M[number][1]>>
  }>
}

export function useAutoForm<M extends FormComponentMapping, T extends z.ZodRawShape, TOut extends z.infer<z.ZodObject<T>> = z.infer<z.ZodObject<T>>>({
  schema,
  onFormSubmit,
  defaultValues,
  mapping
}: AutoFormOptions<M, T, TOut>) {
  const { control, register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  return function Form() {
    return (
      <form onSubmit={handleSubmit(onFormSubmit)}>
        Hello world from form
      </form>
    )
  }
}
