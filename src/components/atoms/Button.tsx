import { styled } from "@theme";

const Button = styled("button", {
  backgroundColor: "$blue5",
  border: "none",
  borderRadius: "$2",
  color: "$white",
  cursor: "pointer",
  px: "16px",
  py: "10px",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    backgroundColor: "$blue6",
  },
  "&:active": {
    transform: "translateY(2px)",
    backgroundColor: "$blue7",
  },
  variants: {
    color: {
      green: {
        backgroundColor: "$green5",
        "&:hover": { backgroundColor: "$green6" },
        "&:active": { backgroundColor: "$green7" },
      },
      red: {
        backgroundColor: "$red5",
        "&:hover": { backgroundColor: "$red6" },
        "&:active": { backgroundColor: "$red7" },
      },
      orange: {
        backgroundColor: "$orange5",
        "&:hover": { backgroundColor: "$orange6" },
        "&:active": { backgroundColor: "$orange7" },
      },
      gray: {
        backgroundColor: "$gray5",
        "&:hover": { backgroundColor: "$gray6" },
        "&:active": { backgroundColor: "$gray7" },
      },
    },
  },
});

export default Button;
