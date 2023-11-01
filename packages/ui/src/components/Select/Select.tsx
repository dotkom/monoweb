// your-select.jsx
import * as React from "react"
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from "../../utils";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";


const Select = SelectPrimitive.Root

const SelectTrigger = SelectPrimitive.Trigger

const SelectValue = SelectPrimitive.Value

const SelectPortal = SelectPrimitive.Portal

const SelectViewPort = SelectPrimitive.Viewport

const SelectGroup = SelectPrimitive.Group

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "animate-in data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 border-slate-7 text-slate-11 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
        "bg-slate-1 dark:bg-slate-5",
        className
      )}
      {...props}
    />
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName


const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "text-md relative flex cursor-default select-none items-center rounded px-2 py-1.5 font-medium outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      "focus:bg-slate-3 focus:dark:bg-slate-7",
      className
    )}
    {...props}
  />
))
SelectItem.displayName = SelectPrimitive.Item.displayName


const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("text-md text-slate-11 px-2 py-1.5 font-semibold", inset && "pl-8", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("bg-slate-7 -mx-1 my-1 h-px", className)} {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

const SelectShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("text-slate-11 ml-auto text-sm tracking-widest", className)} {...props} />
}
SelectShortcut.displayName = "Selectshortcut"

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectShortcut,
  SelectGroup,
  SelectPortal,
}


// export const Select = forwardRef(
//   ({ children, ...this.props }, ref) => {
//     return (
//       <SelectPrimitive.Root {...props}>
//         <SelectPrimitive.Trigger ref={ref}>
//           <SelectPrimitive.Value />
//           <SelectPrimitive.Icon>
//             <p>i</p>
//           </SelectPrimitive.Icon>
//         </SelectPrimitive.Trigger>
//         <SelectPrimitive.Portal>
//           <SelectPrimitive.Content>
//             <SelectPrimitive.ScrollUpButton>
//               <p>i</p>
//             </SelectPrimitive.ScrollUpButton>
//             <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
//             <SelectPrimitive.ScrollDownButton>
//               <p>i</p>
//             </SelectPrimitive.ScrollDownButton>
//           </SelectPrimitive.Content>
//         </SelectPrimitive.Portal>
//       </SelectPrimitive.Root>
//     );
//   }
// );

// export const SelectItem = forwardRef(
//   (props, ref) => {
//     return (
//       <SelectPrimitive.Item {...props} ref={ref}>
//         <SelectPrimitive.ItemText>Hei</SelectPrimitive.ItemText>
//         <SelectPrimitive.ItemIndicator>
//           <p>i</p>
//         </SelectPrimitive.ItemIndicator>
//       </SelectPrimitive.Item>
//     );
//   }
// );
