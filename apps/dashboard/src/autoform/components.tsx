import { ErrorMessage } from "@hookform/error-message"
import { TextInput, TextInputProps } from "@mantine/core"
import { FieldErrors, FieldValues, UseFormRegisterReturn } from "react-hook-form"

type AutoFormTextInputProps<T extends FieldValues> = {
  errors: FieldErrors<T>
} & TextInputProps &
  UseFormRegisterReturn

export function AutoFormTextInput<T extends FieldValues>({ errors, ...props }: AutoFormTextInputProps<TextInputProps>) {
  return <TextInput error={errors.title && <ErrorMessage errors={errors} name="title" />} {...props} />
}
