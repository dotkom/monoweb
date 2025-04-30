import type { FC } from "react"
import type { Control, FieldValue, FieldValues, FormState, UseFormRegister } from "react-hook-form"

export interface InputFieldContext<T extends FieldValues> {
  name: FieldValue<T>
  register: UseFormRegister<T>
  control: Control<T>
  state: FormState<T>
  defaultValue: FieldValue<T>
}
export type InputProducerResult<F extends FieldValues> = FC<InputFieldContext<F>>
