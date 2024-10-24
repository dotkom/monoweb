import { Select, SelectTrigger, SelectValue, SelectIcon, SelectPortal, SelectContent, SelectViewport, SelectGroup, SelectItem } from "../Select";
import { forwardRef } from "react";

export const EnumSelect = forwardRef<HTMLButtonElement, { options: { label: string, value: string }[] } & React.ComponentProps<typeof Select>>(
  ({ options, value, onValueChange, ...props }, ref) => <Select {...props} value={value} onValueChange={e => onValueChange?.(e)}>
    <SelectTrigger ref={ref} value={value}>
      <SelectValue placeholder="Velg" />
      <SelectIcon />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent>
        <SelectViewport>
          <SelectGroup>
            {options.map(option => (
              <SelectItem key={option.value} label={option.label} value={option.value} />
            ))}
          </SelectGroup>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </Select>
)