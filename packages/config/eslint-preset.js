const path = require("node:path");

/**
 * @type {import("eslint").Linter.Config}
 * */
module.exports = {
  env: {
    node: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/stylistic",
    "plugin:perfectionist/recommended-natural",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "turbo",
    "prettier",
  ],

  ignorePatterns: ["*.stories.tsx", "dist/", "node_modules/", "apps/docs/"],

  overrides: [
    {
      files: ["packages/db/src/migrations/*"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [path.resolve(__dirname, "tsconfig.json"), "./packages/*/tsconfig.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },

  plugins: ["@typescript-eslint"],

  root: true,

  rules: {
    "@typescript-eslint/array-type": ["error", { default: "generic" }],
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
    "@typescript-eslint/explicit-member-accessibility": "error",
    "@typescript-eslint/method-signature-style": ["error", "method"],
    "@typescript-eslint/no-meaningless-void-operator": "error",
    "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-unnecessary-condition": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/promise-function-async": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "arrow-body-style": ["error", "as-needed"],
    "consistent-return": "error",
    "curly": "error",
    "eqeqeq": ["error", "smart"],
    "no-constant-binary-expression": "error",
    "no-constructor-return": "error",
    "no-else-return": "error",
    "no-implicit-coercion": "error",
    "no-lonely-if": "error",
    "no-multi-assign": "error",
    "no-multi-spaces": "error",
    "no-new-native-nonconstructor": "error",
    "no-param-reassign": "error",
    "no-self-compare": "error",
    "no-unneeded-ternary": "error",
    "no-unused-private-class-members": "error",
    "no-useless-concat": "error",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "object-curly-newline": [
      "error",
      {
        ObjectExpression: {
          consistent: true,
          minProperties: 4,
          multiline: true,
        },
      },
    ],

    "object-shorthand": "error",
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        next: [
          "break",
          "case",
          "class",
          "continue",
          "default",
          "for",
          "if",
          "return",
          "switch",
          "throw",
          "try",
          "while",
        ],
        prev: "*",
      },
      {
        blankLine: "always",
        next: "*",
        prev: ["multiline-block-like", "multiline-const", "multiline-expression", "multiline-let"],
      },
    ],
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-template": "error",
    "quote-props": ["error", "consistent-as-needed"],
    "quotes": ["error", "double", { avoidEscape: true }],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "yoda": ["error", "never"],
  },

  settings: {
    react: {
      version: "detect",
    },
  },
};
