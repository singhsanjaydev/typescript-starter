// @ts-check
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const functionLike = ":matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression)";

export default defineConfig(
  globalIgnores(["dist/", "node_modules/"]),

  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },

  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /* Explicit developer intent */
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
          allowDirectConstAssertionInArrowFunctions: false,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
          allowFunctionsWithoutTypeParameters: false,
          allowIIFEs: false,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": [
        "error",
        {
          allowArgumentsExplicitlyTypedAsAny: false,
          allowHigherOrderFunctions: false,
          allowTypedFunctionExpressions: false,
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            ":not(ForOfStatement, ForInStatement) > VariableDeclaration > VariableDeclarator[id.typeAnnotation=undefined]",
          message:
            'Explicit type required: annotate the variable, e.g. `const name: string = "..."`.',
        },
        {
          selector: `${functionLike} > Identifier.params[typeAnnotation=undefined]`,
          message: "Explicit type required: annotate every function parameter.",
        },
        {
          selector: `${functionLike} > AssignmentPattern.params > .left[typeAnnotation=undefined]`,
          message: "Explicit type required: annotate parameters that have default values.",
        },
        {
          selector: `${functionLike} > :matches(ObjectPattern, ArrayPattern, RestElement).params[typeAnnotation=undefined]`,
          message: "Explicit type required: annotate destructured and rest parameters.",
        },
        {
          selector: ":matches(PropertyDefinition, AccessorProperty)[typeAnnotation=undefined]",
          message: "Explicit type required: annotate every class property.",
        },
      ],

      /* Type-system escape hatches */
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-check": true,
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],

      /* Correctness that the compiler does not check */
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowNullableEnum: false,
          allowAny: false,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { considerDefaultExhaustiveForUnions: false, requireDefaultForNonUnion: true },
      ],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/require-array-sort-compare": ["error", { ignoreStringArrays: false }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-use-before-define": "error",
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/method-signature-style": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          caughtErrors: "all",
          ignoreRestSiblings: false,
          reportUsedIgnorePattern: true,
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        { selector: "variable", modifiers: ["const"], format: ["camelCase", "UPPER_CASE"] },
        { selector: "import", format: ["camelCase", "PascalCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "objectLiteralProperty", modifiers: ["requiresQuotes"], format: null },
      ],

      /* Core JavaScript rules */
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      "no-param-reassign": ["error", { props: true }],
      "no-implicit-coercion": "error",
      "no-new-wrappers": "error",
      "no-eval": "error",
      "no-console": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-nested-ternary": "error",
      "no-lonely-if": "error",
      "no-useless-rename": "error",
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
      radix: "error",
    },
  },

  {
    files: ["**/*.js"],
    extends: [js.configs.recommended],
  },
);
