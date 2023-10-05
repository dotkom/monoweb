import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn("text-foreground bg-slate-3 inline-flex items-center justify-center rounded-md p-1", className)}
        {...props}
    />
));

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        className={cn(
            "rdx-state-active:text-slate-12 rdx-state-active:bg-slate-2 text-slate-9 rdx-state-active:shadow-sm inline-flex  min-w-[100px] items-center justify-center rounded-[0.185rem]  px-3 py-1.5 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
            className
        )}
        {...props}
        ref={ref}
    />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        className={cn("mt-2 rounded-md border border-slate-200 p-6", className)}
        {...props}
        ref={ref}
    />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;

export {
 Tabs, TabsContent, TabsList, TabsTrigger 
};
