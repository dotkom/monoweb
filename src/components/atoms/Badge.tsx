import { styled } from "@theme";

const getVariants = (color1: string, color2: string) => ({
    subtle: {
        bg: "none",
        color: color2,
        border: "1px solid",
        borderColor: color2,
    },
        solid: {
        color: "$white",
        bg: color2,
    },
        outline: {
        color: color2,
        bg: color1,
    },
});

const Badge = styled("p", {
    borderRadius: "5px",
    fontWeight: "600",
    padding: "0 0.5rem",
    display: "inline-block",
    
    variants: {
        green: getVariants("#D9EFE3", "#43B171"),
        gray: getVariants("#EDF2F7", "#718096"),
        blue: getVariants("#bac4f3", "#2544da"),
        red: getVariants("#FBDDE2", "#EB536E"),
        orange: getVariants("#FFF0D0", "#FEB515"),
        }
});

export default Badge;
