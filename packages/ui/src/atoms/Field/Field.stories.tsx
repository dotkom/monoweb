import { Input } from "#components/input"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "./Field"

export default {
  title: "Field",
}

export const Default = () => (
  <Field>
    <FieldContent>
      <FieldLabel>Tittel</FieldLabel>
      <FieldDescription>Tittel for arrangementet</FieldDescription>
    </FieldContent>
    <Input placeholder="ITEX 2026" />
    <FieldError>Tittelen kan ikke være tom</FieldError>
  </Field>
)
