import type { FC } from "react"
import type {
  Control,
  FieldPath,
  FieldValue,
  FieldValues,
  FormState,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"

export interface InputFieldContext<T extends FieldValues, TTransformedValues extends FieldValues | undefined = T> {
  name: FieldPath<T>
  register: UseFormRegister<T>
  control: Control<T, unknown, TTransformedValues>
  state: FormState<T>
  defaultValue: FieldValue<T>
  setValue: UseFormSetValue<T>
  getValues: UseFormGetValues<T>
  setError(name: FieldPath<T>, error: { type: string; message: string }): void
  clearErrors(name?: FieldPath<T>): void
  disabled?: boolean
}
export type InputProducerResult<F extends FieldValues, TTransformedValues extends FieldValues | undefined = F> = FC<
  InputFieldContext<F, TTransformedValues>
>

export function getErrorMessage<T extends FieldValues>(state: FormState<T>, name: FieldPath<T>): string | undefined {
  // i don't know why type inference is not working properly here
  return state.errors[name]?.message as string | undefined
}
