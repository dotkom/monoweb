import { z } from "zod"
import { FC, ReactElement } from "react"
import {
  Button,
  Checkbox,
  CheckboxProps,
  Flex,
  Select,
  SelectProps, Textarea,
  TextareaProps,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import {
  Control,
  Controller,
  DeepPartial,
  FieldValue,
  FieldValues,
  FormState,
  useForm,
  UseFormRegister,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@hookform/error-message"
import { DateTimeInput, DateTimeInputProps } from "../components/DateTimeInput"

type InputFieldContext<T extends FieldValues> = {
  name: FieldValue<T>
  register: UseFormRegister<T>
  control: Control<T>
  state: FormState<T>
}
type InputProducerResult<F extends FieldValues> = FC<InputFieldContext<F>>

export function createSelectInput<F extends FieldValues>({
  ...props
}: Omit<SelectProps, "error">): InputProducerResult<F> {
  return ({ name, state, register, control }) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...props}
            value={field.value}
            onChange={field.onChange}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
          />
        )}
      />
    )
  }
}

export function createDateTimeInput<F extends FieldValues>({
  ...props
}: Omit<DateTimeInputProps, "error">): InputProducerResult<F> {
  return ({ name, state, register, control }) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DateTimeInput
            {...props}
            value={field.value}
            onChange={field.onChange}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
          />
        )}
      />
    )
  }
}

export function createCheckboxInput<F extends FieldValues>({
  ...props
}: Omit<CheckboxProps, "error">): InputProducerResult<F> {
  return ({ name, state, register, control }) => {
    return (
      <Checkbox
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
      />
    )
  }
}

export function createTextareaInput<F extends FieldValues>({
  ...props
}: Omit<TextareaProps, 'error'>): InputProducerResult<F> {
  return ({ name, state, register, control }) => {
    return (
      <Textarea
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
      />
    )
  }
}

export function createTextInput<F extends FieldValues>({
  ...props
}: Omit<TextInputProps, "error">): InputProducerResult<F> {
  return ({ name, state, register, control }) => {
    return (
      <TextInput
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
      />
    )
  }
}

function entriesOf<T extends Record<string, unknown>, K extends keyof T & string>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][]
}

type FormBuilderOptions<T extends z.ZodRawShape> = {
  schema: z.ZodObject<T>
  fields: Partial<{
    [K in keyof z.infer<z.ZodObject<T>>]: InputProducerResult<z.infer<z.ZodObject<T>>>
  }>
  defaultValues?: DeepPartial<{
    [K in keyof z.infer<z.ZodObject<T>>]: z.infer<T[K]>
  }>
  label: string
  onSubmit: (data: z.infer<z.ZodObject<T>>) => void
}

export function useFormBuilder<T extends z.ZodRawShape>({
  schema,
  fields,
  defaultValues,
  label,
  onSubmit,
}: FormBuilderOptions<T>): ReactElement {
  const form = useForm<z.infer<z.ZodObject<T>>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const components = entriesOf(fields).map(([name, fc]) => {
    const Component: InputProducerResult<z.infer<z.ZodObject<T>>> = fc!
    return <Component key={name} name={name} register={form.register} control={form.control} state={form.formState} />
  })
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Flex direction="column" gap="md">
        {components}

        <div>
          <Button type="submit">{label}</Button>
        </div>
      </Flex>
    </form>
  )
}
