import type { VariantProps } from "cva";

import { cva } from "cva";
import * as React from "react";

import { cn } from "../../utils";

export interface CardProps extends VariantProps<typeof card> {
    children?: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = (props) => (
    <div className={cn(props.className, card({ outlined: props.outlined, shadow: props.shadow }))}>
        {props.children}
    </div>
);

const card = cva("box-border m-0 min-w-0 border p-1 rounded", {
    defaultVariants: {
        outlined: true,
        shadow: false,
    },
    variants: {
        outlined: {
            true: "border-slate-12",
        },
        shadow: {
            true: "shadow-md",
        },
    },
});
