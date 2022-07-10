import React, { Dispatch, SetStateAction } from "react"
import { styled } from "@stitches/react"
import { blackA } from "@radix-ui/colors"
import * as SwitchPrimitive from "@radix-ui/react-switch"

const StyledSwitch = styled(SwitchPrimitive.Root, {
  all: "unset",
  width: 42,
  height: 25,
  backgroundColor: "$gray10",
  borderRadius: "9999px",
  position: "relative",
  boxShadow: `0 2px 10px ${blackA.blackA7}`,
  WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
  "&:focus": { boxShadow: `0 0 0 2px $colors$info1` },
  '&[data-state="checked"]': { backgroundColor: "$blue3" },
  "&:disabled": { backgroundColor: "$gray11" },
})

const StyledThumb = styled(SwitchPrimitive.Thumb, {
  display: "block",
  width: 21,
  height: 21,
  backgroundColor: "white",
  borderRadius: "9999px",
  boxShadow: `0 2px 2px ${blackA.blackA7}`,
  transition: "transform 100ms",
  transform: "translateX(2px)",
  willChange: "transform",
  '&[data-state="checked"]': { transform: "translateX(19px)" },
})

// Exports
export const Switch = StyledSwitch
export const SwitchThumb = StyledThumb

const Flex = styled("div", { display: "flex" })
const Label = styled("label", {
  color: "$gray1",
  fontSize: 15,
  lineHeight: 1,
  userSelect: "none",
})

export interface ToggleProps {
  label: string
  disabled?: boolean
  isChecked: boolean
  setIsChecked: Dispatch<SetStateAction<boolean>>
}

const Toggle: React.FC<ToggleProps> = ({ label, disabled, isChecked, setIsChecked }) => {
  return (
    <form>
      <Flex css={{ alignItems: "center" }}>
        <Label htmlFor="s1" css={{ paddingRight: 15 }}>
          {label}
        </Label>
        <Switch id="s1" disabled={disabled} onChange={() => setIsChecked(!isChecked)}>
          <SwitchThumb />
        </Switch>
      </Flex>
    </form>
  )
}

export default Toggle
