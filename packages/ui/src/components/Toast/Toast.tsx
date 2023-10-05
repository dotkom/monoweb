import { cva } from "cva";
import { type FC, type ReactNode } from "react";

import { AlertIcon } from "../Alert/AlertIcon";
import { Icon } from "../Icon";

export interface ToastProps {
    children: ReactNode;
    monochrome?: boolean;
    status: "danger" | "info" | "success" | "warning";
}

const Toast: FC<ToastProps> = ({ children, monochrome, status }) => {
    const styleCheck = monochrome ? "monochrome" : status;

    return (
        <div className={base({ color: styleCheck })}>
            <div className="flex">
                <AlertIcon status={status}></AlertIcon>
                {children}
            </div>
            {/* The monochrome value is inverted because we want a white or black icon with colored background*/}

            <button className="ml-auto border-0 bg-transparent transition-transform hover:-translate-y-[1px] active:translate-y-[2px]">
                <Icon aria-hidden className={close({ color: styleCheck })} icon="tabler:x" width={24} />
            </button>
        </div>
    );
};

const base = cva("flex align-center p-2 rounded max-w-[360px] text-slate-1 shadow-md", {
    variants: {
        color: {
            danger: "bg-red-9 text-slate-12",
            info: "bg-blue-9 text-slate-12",
            monochrome: "bg-white",
            success: "bg-green-9 text-slate-12",
            warning: "bg-amber-9",
        },
    },
});

const close = cva("w-6 h-6 text-slate-1", {
    variants: {
        color: {
            danger: "bg-red-9 text-slate-12",
            info: "bg-blue-9 text-slate-12",
            monochrome: "",
            success: "bg-green-9 text-slate-12",
            warning: "bg-amber-9",
        },
    },
});

export default Toast;
