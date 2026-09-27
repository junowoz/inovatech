import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "_legacy/**",
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      "design/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
