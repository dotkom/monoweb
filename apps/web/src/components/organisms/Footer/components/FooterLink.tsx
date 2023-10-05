import { cva } from "cva";

interface FooterLinkProps {
    label: string;
    large?: boolean;
}

export const FooterLink = ({ label, large = false }: FooterLinkProps) => <li className={link({ large })}>{label}</li>;

const link = cva("text-slate-12 cursor-pointer", {
    variants: {
        large: {
            false: "text-lg font-medium",
            true: "text-xl font-bold",
        },
    },
});
