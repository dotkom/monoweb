import { ErrorMessage } from "@hookform/error-message"
import { Checkbox } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

interface CheckboxGroupsProps {
  selected: number[]
  setSelected(value: number[]): void
  disabledOptions?: number[]
  entries: { label: string; key: number }[]
}

const CheckboxGroup = ({ selected, disabledOptions, setSelected, entries }: CheckboxGroupsProps) => {
  const onChange = (key: number) => () => {
    if (selected.includes(key)) {
      setSelected(selected.filter((val) => val !== key))
    } else {
      setSelected([...selected, key])
    }
  }

  return (
    <table>
      {entries.map(({ label, key }) => (
        <tbody key={label}>
          <tr>
            <td width="100">{label}</td>
            <td>
              <Checkbox
                checked={selected.includes(key)}
                disabled={disabledOptions?.includes(key)}
                onChange={onChange(key)}
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
