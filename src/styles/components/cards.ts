import { Theme } from "theme-ui";

const cards: Theme["cards"] = {
  base: {
    bg: "white",
    borderRadius: "6px",
    padding: 4,
  },
  primary: {
    variant: "cards.base",
    boxShadow: `
        1.1px 0.6px 5.2px -5px rgba(0, 0, 0, 0.022),
        2.4px 1.2px 13px -5px rgba(0, 0, 0, 0.031),
        4.4px 2.2px 26.6px -5px rgba(0, 0, 0, 0.039),
        9px 4.5px 54.8px -5px rgba(0, 0, 0, 0.048),
        40px 20px 150px -5px rgba(0, 0, 0, 0.07)`,
  },
  outlined: {
    variant: "cards.base",
    border: "1px solid",
    borderColor: "muted",
  },
};
export default cards;
