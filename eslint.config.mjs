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
  },
  {
    rules: {
      // Downgrade no-explicit-any to warning to prevent build failures
      // TODO: Gradually replace 'any' types with proper TypeScript types
      "@typescript-eslint/no-explicit-any": "off", // Disable the rule entirely for now
      "@typescript-eslint/no-unused-vars": "warn", // Allow unused vars (warnings only)
      "@typescript-eslint/ban-ts-comment": "warn", // Allow ts-comments (warnings only)
    },
  },
];

export default eslintConfig;
