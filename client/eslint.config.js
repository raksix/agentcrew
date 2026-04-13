const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
    rules: {
      "no-console": "off",
      "no-unused-vars": ["off"],
      "no-undef": "off"
    }
  }
];
