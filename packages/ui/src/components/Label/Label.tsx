import * as LabelPrimitive from "@radix-ui/react-label";
import React from "react";

import { cn } from "../../utils";

export const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        className={cn(
            "text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            props.htmlFor && "cursor-pointer",
            className
        )}
        ref={ref}
        {...props}
    />
));

Label.displayName = LabelPrimitive.Root.displayName;
