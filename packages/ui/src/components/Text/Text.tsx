import { type VariantProps, cva } from "cva";
import { type FC, type ReactNode } from "react";

import { cn } from "../../utils";

export interface TextProps extends VariantProps<typeof text> {
    children?: ReactNode;
    className?: string;
}

export const Text: FC<TextProps> = (props) => (
    <p className={cn(text({ size: props.size, truncate: props.truncate }), props.className)}>{props.children}</p>
);

const text = cva("text-slate-12", {
    defaultVariants: {
        size: "md",
        truncate: false,
    },
    variants: {
        size: {
            "2xl": "text-2xl",
            "lg": "text-lg",
            "md": "text-md",
            "sm": "text-sm",
            "xl": "text-xl",
            "xs": "text-xs",
        },
        truncate: {
            true: "truncate",
        },
    },
});
