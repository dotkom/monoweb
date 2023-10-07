import { useState } from "react"
import { StoryDefault } from "@ladle/react"
import { Checkbox } from "./Checkbox"

export default {
  title: "Checkbox",
  decorators: [(Component) => (
    <div className="p-10">
      <Component />
    </div>
  )],
} satisfies StoryDefault

export const Default = () => {
  const [checked, setChecked] = useState(true)
  return <Checkbox checked={checked} onCheckedChange={(checked) => setChecked(!!checked)} />
}

export const Disabled = () => {
  const [checked, setChecked] = useState(true)
  return <Checkbox checked={checked} onCheckedChange={(checked) => setChecked(!!checked)} disabled />
}

const checkboxes = [
  { label: "Receive email notifications", checked: false, id: "checkbox1" },
  { label: "Receive sms notifications", checked: false, id: "checkbox2" },
  { label: "Receive push notifications", checked: false, id: "checkbox3" },
]

export const Intermediate = () => {
  const [values, setValues] = useState(checkboxes.map((item) => item.checked))
  const allChecked = values.every((value) => value)
  const indeterminate = values.some((value) => value) && !allChecked

  const handleIndeterminate = () => {
    if (!allChecked) {
      setValues([true, true, true])
    } else {
      setValues([false, false, false])
    }
  }

  return (
    <div className="grid gap-2">
      {JSON.stringify(values)}
      <Checkbox
        label="select all"
        checked={indeterminate ? "indeterminate" : allChecked}
        onCheckedChange={handleIndeterminate}
        id="intermediate"
      />
      <div className="ml-7 grid gap-1.5">
        {checkboxes.map((item, index) => (
          <Checkbox
            key={item.id}
            label={item.label}
            checked={values[index]}
            id={item.id}
            onCheckedChange={(e) => {
              setValues((values) => {
                const newValues = [...values]
                newValues[index] = !newValues[index]
                return newValues
              })
            }}
          />
        ))}
      </div>
    </div>
  )
}
