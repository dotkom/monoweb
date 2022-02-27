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

const getVariant = () => ({
    color: {
        green: {
            bg: "#D9EFE3",
            color: "#43B171",
            borderColor: "#43B171"
        },
        gray: {
            bg: "#EDF2F7",
            color: "##718096",
            borderColor: "#718096"
        },
        blue: {
            bg: "#bac4f3",
            color: "#2544da",
            borderColor: "#2544da"
        },
        red: {
            bg: "#FBDDE2",
            color: "#EB536E",
            borderColor: "#EB536E"
        },
        orange: {
            bg: "#FFF0D0",
            color: "#FEB515",
            borderColor: "#FEB515"
        }
    },
    variant: {
        solid: {
        color: "none",
        // bg: "inherit color"
        },
        subtle: {
            bg: "none",
            border: "1px solid",
        },
        outline: {
        },
    },
});

const Badge = styled("p", {
    borderRadius: "5px",
    fontWeight: "600",
    padding: "0 0.5rem",
    display: "inline-block",
    
    /*
    variants: getVariant(),
    */
    
    variants: {
        green: getVariants("#D9EFE3", "#43B171"),
        gray: getVariants("#EDF2F7", "#718096"),
        blue: getVariants("#bac4f3", "#2544da"),
        red: getVariants("#FBDDE2", "#EB536E"),
        orange: getVariants("#FFF0D0", "#FEB515"),
        }
});

export default Badge;
