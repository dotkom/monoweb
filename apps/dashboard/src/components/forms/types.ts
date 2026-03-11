import type { FC } from "react"
import type { Control, FieldValue, FieldValues, FormState, UseFormRegister } from "react-hook-form"

export interface InputFieldContext<T extends FieldValues> {
  name: FieldValue<T>
  register: UseFormRegister<T>
  control: Control<T>
  state: FormState<T>
  defaultValue: FieldValue<T>
  setError(name: FieldValue<T>, error: { type: string; message: string }): void
  clearErrors(name: FieldValue<T>): void
}
export type InputProducerResult<F extends FieldValues> = FC<InputFieldContext<F>>
