import type { VariantProps } from "cva";

import { cva } from "cva";
import React, { forwardRef } from "react";

import { cn } from "../../utils";
import { Icon } from "../Icon";

type Color = "amber" | "blue" | "green" | "red" | "slate";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
    color?: Color;
    icon?: React.ReactNode;
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <button
        {...props}
        className={cn(
            buttonStyles({ size: props.size, variant: props.variant }),
            props.color && getColorStyles(props.variant, props.color),
            props.color === "amber" && props.variant === "solid" && "text-slate-1",
            "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40",
            props.className
        )}
        disabled={props.disabled || props.loading}
        ref={ref}
        type={props.type}
    >
        <div className="flex items-center justify-center">
            {(props.loading || props.icon) && (
                <i className="mr-1 flex">
                    {props.loading ? <Icon className="animate-spin" icon="tabler:loader-2" width={16} /> : props.icon}
                </i>
            )}
            <span className="text-inherit">{props.children}</span>
        </div>
    </button>
));

export const buttonStyles = cva(
    [
        "cursor-pointer appearance-none rounded-md px-4 py-2 font-semibold",
        "focus:ring-2 focus:ring-slate-11 focus:outline-none",
        "transition-transform",
        "hover:-translate-y-[1px] active:translate-y-[2px]",
    ],
    {
        defaultVariants: {
            size: "md",
            variant: "brand",
        },
        variants: {
            size: {
                lg: "text-lg px-5 h-13 font-bold",
                md: "text-md px-4 h-11 font-semibold",
                sm: "text-sm px-3 h-9 font-medium",
            },
            variant: {
                brand: "bg-brand text-white hover:bg-brand-dark active:bg-brand-darker",
                gradient: "bg-gradient-to-r from-[#0D5474] to-[#153E75] text-white ",
                light: "text-current",
                link: "bg-transparent underline-offset-4 hover:underline text-slate-11 hover:translate-y-0 active:translate-y-0",
                outline: "bg-transparent border-2 border-slate-11 hover:bg-slate-4 focus:ring-blue-10 text-slate-11",
                solid: "text-slate-12",
                subtle: "bg-transparent",
            },
        },
    }
);

export const getColorStyles = (variant: VariantProps<typeof buttonStyles>["variant"], color: Color) => {
    switch (variant) {
        case "solid":
            return `bg-${color}-9 hover:bg-${color}-10` as const;

        case "light":
            return `bg-${color}-4 text-${color}-11 hover:bg-${color}-5` as const;

        case "subtle":
            return `bg-transparent text-${color}-11 hover:bg-${color}-2` as const;

        default:
            return "";
    }
};
