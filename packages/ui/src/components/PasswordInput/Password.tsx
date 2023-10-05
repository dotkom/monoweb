import { Label } from "@radix-ui/react-label";
import { cva } from "cva";
import { forwardRef, useState } from "react";

import { Icon } from "../Icon";

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
    error?: boolean | string;
    eyeColor: "default" | "gray" | "slate";
    inputInfo?: string;
    label?: string;
    placeholder?: string;
    withAsterisk?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
    ({ error, eyeColor, inputInfo, label, withAsterisk, ...props }, ref) => {
        const [visible, setVisibility] = useState(false);
        const InputType = visible ? "text" : "password";

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <Label className="mb-1" htmlFor={props.id}>
                        {label} {withAsterisk && <span className="text-red-11">*</span>}
                    </Label>
                )}
                <p>{inputInfo}</p>
                <div className="relative">
                    <input type={InputType} {...props} className={input({ error: Boolean(error) })} ref={ref} />
                    <div>
                        <span className={eye({ color: eyeColor })}>
                            <Icon
                                icon={visible ? "tabler:eye-check" : "tabler:eye-off"}
                                onClick={() => setVisibility((visibility) => !visibility)}
                                width={24}
                            />
                        </span>
                    </div>
                </div>
                {typeof error === "string" && <span className="text-red-11 mt-1 text-xs">{error}</span>}
            </div>
        );
    }
);

const input = cva("border-solid border outline-none focus:border-blue-7 bg-slate-3 rounded-md p-2 w-full ", {
    variants: {
        error: {
            false: "text-slate-12 border-slate-6",
            true: "text-slate-12 border-red-7",
        },
    },
});

const eye = cva("absolute top-2 right-2 flex hover: cursor-pointer", {
    variants: {
        color: {
            default: "text-solid",
            gray: "text-slate-11",
            slate: "text-slate-7",
        },
    },
});
