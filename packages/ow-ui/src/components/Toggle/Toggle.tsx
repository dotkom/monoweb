import * as SwitchPrimitive from "@radix-ui/react-switch"
import React, { Dispatch, SetStateAction } from "react"
import { Label } from "@radix-ui/react-label"
import { Text } from "../Typography"

export interface ToggleProps {
  label: string
  disabled?: boolean
  isChecked: boolean
  setIsChecked: Dispatch<SetStateAction<boolean>>
}

export const Toggle: React.FC<ToggleProps> = ({ label, disabled, isChecked, setIsChecked }) => {
  return (
    <form>
      <div className="flex items-center">
        <Label htmlFor="s1" className="pr-2">
          <Text>{label}</Text>
        </Label>
        <SwitchPrimitive.Root
          className="all-unset bg-slate-10 rdx-state-checked:bg-blue-3 disabled:bg-slate-11 relative h-[25px] w-[42px] rounded-full shadow"
          id="s1"
          disabled={disabled}
          onChange={() => setIsChecked(!isChecked)}
        >
          <SwitchPrimitive.Thumb className="rdx-state-checked:translate-x-[19px] block h-[21px] w-[21px] rounded-full bg-white shadow transition-transform duration-1000 will-change-transform" />
        </SwitchPrimitive.Root>
      </div>
    </form>
  )
}
