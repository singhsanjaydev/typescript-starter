# 8. Strictness philosophy

In this project, **"strict" does not mean `"strict": true`.** That flag is the starting point (and,
since TypeScript 6.0, the default). This document lists everything layered on top.

## The definition

Code in this project is "strict" when:

1. **Every value has a known, non-`any` type.**
2. **Every possible absence (`undefined`/`null`) is handled.**
3. **The developer's intent is written down**, not left to inference.
4. **No mechanism exists to silence the compiler or linter from inside the code.**
5. **The program is environment-neutral**: only ECMAScript built-ins exist.
6. **TypeScript adds only types**: removing them yields the JavaScript program.

## Layer 1 — `strict: true` (compiler)

`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`,
`strictPropertyInitialization`, `strictBuiltinIteratorReturn`, `noImplicitThis`,
`useUnknownInCatchVariables`, `alwaysStrict`. See [compiler-options.md](compiler-options.md).

## Layer 2 — additional compiler restrictions

| Restriction                        | Rule(s)                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| Indexed access may be `undefined`  | `noUncheckedIndexedAccess`                                                                        |
| Optional ≠ `undefined`             | `exactOptionalPropertyTypes`                                                                      |
| Dynamic keys look dynamic          | `noPropertyAccessFromIndexSignature`                                                              |
| All code paths return              | `noImplicitReturns`                                                                               |
| Overrides are explicit             | `noImplicitOverride`                                                                              |
| No accidental `switch` fallthrough | `noFallthroughCasesInSwitch`                                                                      |
| No dead code                       | `noUnusedLocals`, `noUnusedParameters`, `allowUnreachableCode: false`, `allowUnusedLabels: false` |
| Explicit types on exports          | `isolatedDeclarations`                                                                            |
| Explicit type-only imports         | `verbatimModuleSyntax`                                                                            |
| Types are erasable only            | `erasableSyntaxOnly`                                                                              |
| No host environment                | `lib: ["es2025"]`, `types: []`                                                                    |
| Broken code produces no output     | `noEmitOnError`                                                                                   |
| All declarations checked           | `skipLibCheck: false`                                                                             |

## Layer 3 — lint restrictions (typescript-eslint + ESLint)

| Restriction                                | Rule(s)                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Annotate variables, parameters, properties | `no-restricted-syntax` (custom selectors)                                                   |
| Annotate every function's return type      | `explicit-function-return-type` (no exemptions), `explicit-module-boundary-types`           |
| Explicit `public`/`private`/`protected`    | `explicit-member-accessibility`                                                             |
| No `any`, and no `any` flowing anywhere    | `no-explicit-any`, `no-unsafe-assignment/-argument/-call/-member-access/-return`            |
| No type assertions (`as T`, `<T>x`)        | `consistent-type-assertions: never` (`as const` still allowed), `no-unsafe-type-assertion`  |
| No non-null assertions (`x!`)              | `no-non-null-assertion` and friends                                                         |
| No `@ts-ignore` / `@ts-nocheck`            | `ban-ts-comment` (`@ts-expect-error` only with a description)                               |
| No `eslint-disable`                        | `linterOptions.noInlineConfig` + `--max-warnings 0`                                         |
| Conditions must be booleans                | `strict-boolean-expressions` (all `allow*` options off)                                     |
| Unions must be handled exhaustively        | `switch-exhaustiveness-check`                                                               |
| No redundant code                          | `no-unnecessary-condition`, `no-unnecessary-type-assertion`, …                              |
| Promises handled                           | `no-floating-promises`, `no-misused-promises`, `promise-function-async`                     |
| Only `Error`s are thrown / rejected        | `only-throw-error`, `prefer-promise-reject-errors`                                          |
| Deprecated APIs flagged                    | `no-deprecated`                                                                             |
| Consistent naming                          | `naming-convention`                                                                         |
| Core JS hygiene                            | `eqeqeq`, `curly`, `no-var`, `prefer-const`, `no-param-reassign`, `no-implicit-coercion`, … |

Full list: [rules-reference.md](rules-reference.md).

## Compiler-enforced vs lint-enforced

| Compiler-enforced                                                | Lint-enforced                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------- |
| Proves type correctness                                          | Enforces policy and style of correct code            |
| Configured in `tsconfig.json`                                    | Configured in `eslint.config.js`                     |
| Blocks `npm run build` (no output on error)                      | Blocks `npm run lint` / `npm run check`              |
| Cannot be silenced except with `@ts-*` comments (banned by lint) | Cannot be silenced inline (`noInlineConfig`)         |
| Example: `scores[0]` is `number \| undefined`                    | Example: `const x = 1` must be `const x: number = 1` |

## What strictness is _not_ here

Rules that only make code harder without making intent clearer were rejected (see
[decisions.md](decisions.md)): e.g. `prefer-readonly-parameter-types`, `no-magic-numbers`,
`sort-type-constituents`, `member-ordering`.
