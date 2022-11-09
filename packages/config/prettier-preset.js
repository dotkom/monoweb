module.exports = {
  semi: false,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 120,
  endOfLine: "auto",
  arrowParens: "always",
  importOrder: ["^@(dotkom)/(.*)$", "^@lib/(.*)$", "^@components/(.*)$", "^@(server|trpc)/(.*)$", "^~/(.*)$", "^[./]", ".css$"],
  importOrderSeparation: true,
  plugins: [require("./merged-prettier-plugin"), require("./tailwind-preset")],
}
