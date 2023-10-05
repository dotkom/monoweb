import { Icon } from "../Icon";
import { cva, type VariantProps } from "cva";
import { type FC } from "react";
import { cn } from "../../utils";

interface AlertIconProps extends Required<VariantProps<typeof iconVariant>> {
    className?: string;
    size?: number;
}

export const AlertIcon: FC<AlertIconProps> = ({ status, className, size = 24 }) => (
    <>
        <Icon icon={iconKey(status)} width={size} className={cn(iconVariant({ status }), className)} />
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
            info: "text-blue-11",
            success: "text-green-11",
            danger: "text-red-11",
            warning: "text-amber-11",
        },
    },
});
