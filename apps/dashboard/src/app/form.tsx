import type { StaticAsset } from "@dotkomonline/types"
import { ErrorMessage } from "@hookform/error-message"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Anchor,
  Box,
  Button,
  Checkbox,
  type CheckboxProps,
  FileInput,
  type FileInputProps,
  Flex,
  Modal,
  MultiSelect,
  type MultiSelectProps,
  NumberInput,
  type NumberInputProps,
  Select,
  type SelectProps,
  Table,
  TagsInput,
  type TagsInputProps,
  Text,
  TextInput,
  type TextInputProps,
  Textarea,
  type TextareaProps,
} from "@mantine/core"
import { DateTimePicker, type DateTimePickerProps } from "@mantine/dates"
import { useDisclosure } from "@mantine/hooks"
import type { FC } from "react"
import {
  type Control,
  Controller,
  type DefaultValues,
  type FieldValue,
  type FieldValues,
  type FormState,
  type UseFormRegister,
  type UseFormReturn,
  useForm,
} from "react-hook-form"
import type { z } from "zod"
import ImageUpload from "../components/molecules/ImageUpload/ImageUpload"

interface InputFieldContext<T extends FieldValues> {
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

interface CheckboxGroupsProps {
  selected: number[]
  setSelected(value: number[]): void
  disabledOptions?: number[]
  labels: string[]
}

const CheckboxGroup = ({ selected, disabledOptions, setSelected, labels }: CheckboxGroupsProps) => {
  const onChange = (idx: number) => () => {
    if (selected.includes(idx)) {
      setSelected(selected.filter((val) => val !== idx))
    } else {
      setSelected([...selected, idx])
    }
  }

  return (
    <table>
      {labels.map((label, idx) => (
        <tbody key={label}>
          <tr>
            <td width="100">{label}</td>
            <td>
              <Checkbox
                checked={selected.includes(idx)}
                disabled={disabledOptions?.includes(idx)}
                onChange={onChange(idx)}
              />
            </td>
          </tr>
        </tbody>
      ))}
    </table>
  )
}

export function createLabelledCheckboxGroupInput<F extends FieldValues>({
  ...props
}: Omit<CheckboxGroupsProps, "error" | "selected" | "setSelected">): InputProducerResult<F> {
  return function LabelledCheckboxGroupInput({ name, state, control }) {
    return (
      <div>
        {state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
        <Controller
          control={control}
          name={name}
          render={({ field }) => <CheckboxGroup {...props} setSelected={field.onChange} selected={field.value} />}
        />
      </div>
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
}: Omit<SelectProps, "data" | "error"> & {
  data: { value: number; label: string }[]
}): InputProducerResult<F> {
  return function FormSelectInput({ name, state, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            {...props}
            data={props.data.map((item) => ({
              ...item,
              value: item.value.toString(),
            }))}
            value={field.value?.toString() ?? ""}
            onChange={(value) => field.onChange(value !== null ? Number.parseInt(value) : null)}
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

export function createImageInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error"> & {
  currentFile?: StaticAsset
  aspect?: number
}): InputProducerResult<F> {
  return function FormFileInput({ name, state, control }) {
    return (
      <Box>
        <Text>{props.label}</Text>
        {props.currentFile && (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Navn</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Lastet opp</Table.Th>
                <Table.Th>Handlinger</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Anchor href={props.currentFile.url} target="_blank" rel="noreferrer">
                    {props.currentFile.fileName}
                  </Anchor>
                </Table.Td>
                <Table.Td>{props.currentFile.fileType}</Table.Td>
                <Table.Td>{props.currentFile.createdAt.toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Button color="red">Slett</Button>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field }) => {
            const [isOpened, { open, close }] = useDisclosure(false)

            return (
              <div>
                <Button
                  onClick={() => {
                    open()
                  }}
                >
                  {props.currentFile ? "Bytt bilde" : "Last opp bilde"}
                </Button>
                <Modal title="Last opp bilde" opened={isOpened} onClose={close} size={"xl"}>
                  {props.currentFile && (
                    <Text mb="sm" fs="italic">
                      Ved å laste opp et nytt bilde vil det gamle bildet bli slettet
                    </Text>
                  )}
                  <ImageUpload
                    onSubmit={(blob) => {
                      console.log(blob)
                      field.onChange(blob)
                      close()
                    }}
                    aspect={props.aspect}
                  />
                </Modal>
              </div>
            )
          }}
        />
      </Box>
    )
  }
}

export function createFileInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error"> & {
  existingFileUrl?: string
}): InputProducerResult<F> {
  return function FormFileInput({ name, state, control }) {
    return (
      <Box>
        <Text>{props.label}</Text>
        {props.existingFileUrl ? (
          <Anchor href={props.existingFileUrl} mb="sm" display="block">
            Link til ressurs
          </Anchor>
        ) : (
          <Text mb="sm" fs="italic">
            Ingen fil lastet opp
          </Text>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <FileInput
              {...props}
              value={field.value}
              onChange={(value) => field.onChange({ target: { value } })}
              error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
              label=""
            />
          )}
        />
      </Box>
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

function entriesOf<T extends Record<string, unknown>, K extends string & keyof T>(obj: T): [K, T[K]][] {
  return Object.entries(obj) as [K, T[K]][]
}

interface FormBuilderOptions<T extends z.ZodRawShape> {
  schema: z.ZodEffects<z.ZodObject<T>> | z.ZodObject<T>
  fields: Partial<{
    [K in keyof z.infer<z.ZodObject<T>>]: InputProducerResult<z.infer<z.ZodObject<T>>>
  }>
  defaultValues?: DefaultValues<z.infer<z.ZodObject<T>>>
  label: string
  onSubmit(data: z.infer<z.ZodObject<T>>, form: UseFormReturn<z.infer<z.ZodObject<T>>>): void
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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          console.log(e)
          return form.handleSubmit((values) => {
            return onSubmit(values, form)
          })(e)
        }}
      >
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
