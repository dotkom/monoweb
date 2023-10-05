import { type VariantProps, cva } from "cva";
import { type FC, type ReactNode } from "react";

import { cn } from "../../utils";

export interface TitleProps extends VariantProps<typeof title> {
    children?: ReactNode;
    className?: string;
    /** The HTML element to use. Defaults to <h2> */
    element?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Title: FC<TitleProps> = (props) => {
    const Component = props.element ?? "h2";

    return (
        <Component
            className={cn(
                props.className,
                title({
                    size: props.size,
                })
            )}
        >
            {props.children}
        </Component>
    );
};

const title = cva("text-slate-12 font-extrabold", {
    defaultVariants: {
        size: "md",
    },
    variants: {
        size: {
            lg: "text-2xl",
            md: "text-xl",
            xl: "text-4xl",
        },
    },
});
