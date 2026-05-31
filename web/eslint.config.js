import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "scripts/generate-static.mjs",
      "scripts/*.mjs",
      "public/sw.js",
      "public/**/*.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
      // eslint-plugin-react-hooks v7 added a stricter `recommended` preset
      // (purity / immutability / set-state-in-effect) and `eslint@10` added
      // `no-useless-assignment`. Each rule flags real-but-acceptable patterns
      // in this codebase (sync external-state initialization, intentional
      // window.location.href reassignment, conditional re-binding). Leaving
      // them off here to keep the dep bump scope-limited; address in a
      // separate follow-up refactor PR.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "no-useless-assignment": "off",
    },
  },
);
