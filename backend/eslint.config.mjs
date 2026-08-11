import js from "@eslint/js";
import globals from "globals";

export default [
  // Apply recommended JavaScript rules to all files
  js.configs.recommended,

  {
    // Targeting JavaScript files
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },

    rules: {
      "no-console": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
      eqeqeq: "error",
    },
  },

  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },

  {
    ignores: ["node_modules/", "dist/", "build/"],
  },
];
