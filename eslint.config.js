import js from "@eslint/js";

export default [
    js.configs.recommended,

   {
       rules: {
           "no-unused-vars": "warn",
           "no-undef": "warn",
           "no-shadow": "off",
           "@typescript-eslint/no-use-before-define": "error",
           "complexity": [10, "error"],
           "no-await-in-loop": "warn",
           "no-eval": "error",
           "no-implied-eval": "error",
           "prefer-promise-reject-errors": "warn",
       }
   }
];
