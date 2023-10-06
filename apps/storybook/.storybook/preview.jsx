import { themes } from "@storybook/theming";
import "@dotkomonline/config/tailwind.css";

export const parameters = {
  darkMode: {
    current: "dark",
  },
  backgrounds: {
    default: "black",
    values: [{ name: "black", value: "#000212" }],
  },
  docs: {
    theme: { ...themes.dark, fontBase: '"Poppins"' },
  },
};

export const decorators = [
  (Story) => {
    return (
      <div className="text-slate-12 font-poppins" data-theme="dark">
        <Story />
      </div>
    );
  },
];
