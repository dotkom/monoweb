import { ErrorMessage } from "@hookform/error-message"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Button,
  Checkbox,
  CheckboxProps,
  Flex,
  MultiSelect,
  MultiSelectProps,
  NumberInput,
  NumberInputProps,
  Select,
  SelectProps,
  TagsInput,
  TagsInputProps,
  Textarea,
  TextareaProps,
  TextInput,
  TextInputProps,
} from "@mantine/core"
import { DateTimePicker, DateTimePickerProps } from "@mantine/dates"
import { FC } from "react"
import {
  Control,
  Controller,
  DefaultValues,
  FieldValue,
  FieldValues,
  FormState,
  useForm,
  UseFormRegister,
} from "react-hook-form"
import { z } from "zod"

type InputFieldContext<T extends FieldValues> = {
  name: FieldValue<T>
  register: UseFormRegister<T>
  control: Control<T>
  state: FormState<T>
  defaultValue: FieldValue<T>
}
type InputProducerResult<F extends FieldValues> = FC<InputFieldContext<F>>

export function createMultipleSelectInput<F extends FieldValues>({
  ...props
}: Omit<MultiSelectProps, "error">): InputProducerResult<F> {
  return function FormMultiSelectInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <MultiSelect
            {...props}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    )
  }
}

export function createTagInput<F extends FieldValues>({
  ...props
}: Omit<TagsInputProps, "error">): InputProducerResult<F> {
  return function FormTagInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TagsInput
            {...props}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
    )
  }
}

export function createSelectInput<F extends FieldValues>({
  ...props
}: Omit<SelectProps, "error">): InputProducerResult<F> {
  return function FormSelectInput({ name, state, control }) {
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

export function createIntegerSelectInput<F extends FieldValues>({
  ...props
}: Omit<SelectProps, "error" | "data"> & { data: { value: number; label: string }[] }): InputProducerResult<F> {
  return function FormSelectInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...props}
            data={props.data.map((item) => ({ ...item, value: item.value.toString() }))}
            value={field.value?.toString() ?? ""}
            onChange={(value) => field.onChange(value !== null ? parseInt(value) : null)}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
          />
        )}
      />
    )
  }
}

export function createDateTimeInput<F extends FieldValues>({
  ...props
}: Omit<DateTimePickerProps, "error">): InputProducerResult<F> {
  return function FormDateTimeInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DateTimePicker
            {...props}
            defaultValue={new Date()}
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
  return function FormCheckboxInput({ name, state, register }) {
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
}: Omit<TextareaProps, "error">): InputProducerResult<F> {
  return function TextareaInput({ name, state, register }) {
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
  return function FormTextInput({ name, state, register }) {
    return (
      <TextInput
        {...register(name)}
        {...props}
        error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
      />
    )
  }
}

export function createNumberInput<F extends FieldValues>({
  ...props
}: Omit<NumberInputProps, "error">): InputProducerResult<F> {
  return function FormNumberInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <NumberInput
            {...props}
            value={field.value}
            onChange={(value) => field.onChange({ target: { value } })}
            error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
          />
        )}
      />
    )
  }
}

function entriesOf<T extends Record<string, unknown>, K extends keyof T & string>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][]
}

type FormBuilderOptions<T extends z.ZodRawShape> = {
  schema: z.ZodObject<T> | z.ZodEffects<z.ZodObject<T>>
  fields: Partial<{
    [K in keyof z.infer<z.ZodObject<T>>]: InputProducerResult<z.infer<z.ZodObject<T>>>
  }>
  defaultValues?: DefaultValues<z.infer<z.ZodObject<T>>>
  label: string
  onSubmit: (data: z.infer<z.ZodObject<T>>) => void
}

export function useFormBuilder<T extends z.ZodRawShape>({
  schema,
  fields,
  defaultValues,
  label,
  onSubmit,
}: FormBuilderOptions<T>): FC {
  const form = useForm<z.infer<z.ZodObject<T>>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const components = entriesOf(fields).map(([name, fc]) => {
    if (!fc) {
      throw new Error()
    }
    const Component: InputProducerResult<z.infer<z.ZodObject<T>>> = fc
    return (
      <Component
        defaultValue={form.formState.defaultValues?.[name]}
        key={name}
        name={name}
        register={form.register}
        control={form.control}
        state={form.formState}
      />
    )
  })

  return function Form() {
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
}
