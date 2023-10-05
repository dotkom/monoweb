import { Label } from "@radix-ui/react-label";
import { cva } from "cva";
import { forwardRef } from "react";

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
    error?: boolean | string;
    label?: string;
    placeholder?: string;
}

export const TextInput = forwardRef<HTMLInputElement, InputProps>(({ error, label, ...props }, ref) => (
    <div className="flex flex-col">
        {label && (
            <Label className="mb-2" htmlFor={props.id}>
                {label} {props.required && <span className="text-red-11">*</span>}
            </Label>
        )}
        <input
            type="text"
            {...props}
            className={input({ disabled: props.disabled, error: Boolean(error) })}
            ref={ref}
        />
        {typeof error === "string" && <span className="text-red-11 mt-1 text-xs">{error}</span>}
    </div>
));

const input = cva("border-solid border outline-none focus:border-blue-7 bg-slate-3 rounded-md p-2", {
    variants: {
        disabled: {
            true: "cursor-not-allowed text-slate-10",
        },
        error: {
            false: "text-slate-12 border-slate-6",
            true: "text-red-11 border-red-7",
        },
    },
});
