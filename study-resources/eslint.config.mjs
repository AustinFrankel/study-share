import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // Allow any types during development - can be tightened later
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unescaped entities in JSX - common in content
      "react/no-unescaped-entities": "warn",
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Allow require imports where needed
      "@typescript-eslint/no-require-imports": "warn",
      // Allow ts-ignore comments
      "@typescript-eslint/ban-ts-comment": "warn",
      // React hooks deps - warn instead of error
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error", // Keep this as error
      // Image optimization warnings
      "@next/next/no-img-element": "warn",
      "jsx-a11y/alt-text": "warn",
      // Allow prefer-const violations
      "prefer-const": "warn"
    }
  },
];

export default eslintConfig;
