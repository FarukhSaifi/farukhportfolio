export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "src/**",
    ],
  },
  {
    files: ["*.{js,mjs,cjs}", "scripts/**/*.{js,mjs,cjs}"],
    rules: {},
  },
];
