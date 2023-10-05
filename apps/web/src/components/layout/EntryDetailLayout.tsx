import { cn } from "@dotkomonline/ui";
import { type FC, type PropsWithChildren } from "react";

export interface EntryDetailLayoutProps {
    color?: "AMBER" | "BLUE" | "GREEN";
    title: string;
    type?: string;
}

export const EntryDetailLayout: FC<PropsWithChildren<EntryDetailLayoutProps>> = ({
    children,
    color = "BLUE",
    title,
    type,
}) => {
    const borderColorClass = cn({
        "border-amber-8": color === "AMBER",
        "border-blue-8": color === "BLUE",
        "border-green-8": color === "GREEN",
    });

    const textColorClass = cn({
        "text-amber-11": color === "AMBER",
        "text-blue-11": color === "BLUE",
        "text-green-11": color === "GREEN",
    });

    return (
        <div className="mx-auto mb-20 flex w-[90vw] max-w-screen-lg flex-col gap-y-16">
            <div className="flex flex-col gap-y-7">
                <div className={cn("flex w-full items-end justify-between gap-x-2 border-b-2 pb-2", borderColorClass)}>
                    <h1>{title}</h1>
                    {type && <div className={cn("text-2xl", textColorClass)}>{type}</div>}
                </div>
                {children}
            </div>
        </div>
    );
};
