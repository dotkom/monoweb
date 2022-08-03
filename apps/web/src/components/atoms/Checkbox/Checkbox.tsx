import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { styled } from "@theme"
import { useState, FC } from "react"
import { FiCheck } from "react-icons/fi"

const CheckboxRoot = styled(CheckboxPrimitive.Root, {
  all: "unset",
  backgroundColor: "$white",
  border: "1px solid $gray7",
  width: 24,
  height: 24,
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 2px 10px $black`,
  transition: "background-color 100ms linear",
  "&:hover": {
    cursor: "pointer",
  },
  variants: {
    checked: {
      true: {
        backgroundColor: "$blue4",
      },
      indeterminate: {
        backgroundColor: "$blue4",
      },
    },
  },
})

const CheckboxIndicator = styled(CheckboxPrimitive.Indicator, {
  color: "$white",
  display: "flex",
})

const Checkbox: FC<CheckboxPrimitive.CheckboxProps> = (props) => {
  const [checked, setChecked] = useState<CheckboxPrimitive.CheckedState>(props.defaultChecked || false)

  return (
    <CheckboxRoot {...props} onCheckedChange={(checked) => setChecked(checked)} checked={checked}>
      <CheckboxIndicator>
        <FiCheck width="15px" height="15px" />
      </CheckboxIndicator>
    </CheckboxRoot>
  )
}

export default Checkbox
