import type { FC } from "react"
import type { Control, FieldPath, FieldValue, FieldValues, FormState, UseFormRegister } from "react-hook-form"

export interface InputFieldContext<T extends FieldValues> {
  name: FieldPath<T>
  register: UseFormRegister<T>
  control: Control<T>
  state: FormState<T>
  defaultValue: FieldValue<T>
  setError(name: FieldPath<T>, error: { type: string; message: string }): void
  clearErrors(name?: FieldPath<T>): void
}
export type InputProducerResult<F extends FieldValues> = FC<InputFieldContext<F>>

export function getErrorMessage<T extends FieldValues>(state: FormState<T>, name: FieldPath<T>): string | undefined {
  // i don't know why type inference is not working properly here
  return state.errors[name]?.message as string | undefined
}
