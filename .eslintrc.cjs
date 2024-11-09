module.exports = {
  root: true,
  env: { browser: false, es2020: true, node: true },
  extends: ["eslint:recommended"],
  ignorePatterns: [".eslintrc.cjs", "package*.json"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: {},
  plugins: [],
  rules: {},
};
