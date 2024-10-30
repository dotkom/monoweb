"use client";
import { forwardRef } from "react";
import { Button, buttonStyles } from "./Button";
import { VariantProps } from "cva";
export interface BackButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonStyles> {
}
export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
    (props, ref) => (
        <button
            {...props}
            onClick={() => history.back()}
            type={props.type}
            ref={ref}
        ></button>
    )
);