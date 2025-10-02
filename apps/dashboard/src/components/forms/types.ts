import type { FC } from "react"
import type { Control, FieldName, FieldValue, FieldValues, FormState, Path, UseFormRegister } from "react-hook-form"

export interface InputFieldContext<T extends FieldValues> {
  name: Path<T>
  register: UseFormRegister<T>
  control: Control<T>
  state: FormState<T>
  defaultValue?: FieldValue<T>
}
export type InputProducerResult<F extends FieldValues> = FC<InputFieldContext<F>>
