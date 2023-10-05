import { type VariantProps, cva } from "cva";
import { type FC } from "react";

import { cn } from "../../utils";
import { Icon } from "../Icon";

interface AlertIconProps extends Required<VariantProps<typeof iconVariant>> {
    className?: string;
    size?: number;
}

export const AlertIcon: FC<AlertIconProps> = ({ className, size = 24, status }) => (
    <>
        <Icon className={cn(iconVariant({ status }), className)} icon={iconKey(status)} width={size} />
    </>
);

const iconKey = (status: AlertIconProps["status"]) => {
    switch (status) {
        case "info":
            return "tabler:info-circle";

        case "success":
            return "tabler:circle-check";

        case "danger":
            return "tabler:alert-circle";

        case "warning":
            return "tabler:alert-triangle";

        default:
            return "tabler:error-404";
    }
};

const iconVariant = cva("", {
    variants: {
        status: {
            danger: "text-red-11",
            info: "text-blue-11",
            success: "text-green-11",
            warning: "text-amber-11",
        },
    },
});
