// your-select.jsx
import * as React from "react"
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from "../../utils";

const Select = SelectPrimitive.Root

const SelectTrigger = SelectPrimitive.Trigger

const SelectValue = SelectPrimitive.Value

const SelectPortal = SelectPrimitive.Portal

const SelectViewPort = SelectPrimitive.Viewport

const SelectGroup = SelectPrimitive.Group

const SelectContent = SelectPrimitive.Content


const SelectItem = React.forwardRef<
React.ElementRef<typeof SelectPrimitive.Item>,
React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
  inset?: boolean
}
>(({ children, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Item {...props} ref={forwardedRef}
    className={cn(
      "text-md flex relative"
    )}
    >
      <SelectPrimitive.ItemText>text</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="SelectItemIndicator">
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});


const SelectLabel = SelectPrimitive.Label

const SelectSeparator = SelectPrimitive.Separator


export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
  SelectPortal,
}
