"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { Icon } from "../Icon";
import { cn } from "../../utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectPortal = SelectPrimitive.Portal;
export const SelectGroup = SelectPrimitive.Group;

export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-[35px] items-center justify-center gap-[5px] rounded px-[15px] text-[13px] leading-none",
      "bg-white-3 outline-none placeholder:text-slate-9",
      "hover:bg-white-4 active:bg-white-5 focus:ring-2 focus:ring-brand",
      "border border-solid border-slate-6",
      className,
    )}
    {...props}
  >
    {children}
  </SelectPrimitive.Trigger>
));

export const SelectIcon = forwardRef<
  ElementRef<typeof SelectPrimitive.Icon>,
  Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Icon>, "children">
>((props, ref) => (
  <SelectPrimitive.Icon ref={ref} {...props}>
    <Icon icon="tabler:chevron-down" />
  </SelectPrimitive.Icon>
));

export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden rounded-md bg-[#ffffff]",
      "shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]",
      className,
    )}
    {...props}
  />
));

export const SelectScrollUpButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  Omit<
    ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>,
    "children"
  >
>((props, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className="bg-white-3 flex h-[25px] cursor-default items-center justify-center text-blue-11"
    {...props}
  >
    <Icon icon="tabler:chevron-up" />
  </SelectPrimitive.ScrollUpButton>
));

export const SelectScrollDownButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  Omit<
    ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>,
    "children"
  >
>((props, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className="bg-white-3 flex h-[25px] cursor-default items-center justify-center text-blue-11"
    {...props}
  >
    <Icon icon="tabler:chevron-down" />
  </SelectPrimitive.ScrollDownButton>
));

export const SelectViewport = forwardRef<
  ElementRef<typeof SelectPrimitive.Viewport>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Viewport>
>((props, ref) => (
  <SelectPrimitive.Viewport
    ref={ref}
    className="bg-white-3 p-[5px]"
    {...props}
  />
));

export const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>((props, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className="px-[25px] text-xs leading-[25px] text-slate-11"
    {...props}
  />
));

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Item>, "children"> & {
    label: string;
  }
>(({ label, className, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "text-violet11 data-[disabled]:text-mauve8 data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1 relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-[13px] leading-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
      <Icon icon="tabler:check" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
