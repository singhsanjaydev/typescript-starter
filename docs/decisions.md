# Decision log

Each entry: **Decision · Reason · Alternative · Why the alternative was rejected.**

---

### D1. Use TypeScript 6.0, not 7.0

- **Decision:** `typescript@6.0.3`.
- **Reason:** typescript-eslint (required for type-aware lint rules) supports `<6.1.0`; TS 7.0 has
  no stable JS API yet and crashes typescript-eslint on load.
- **Alternative:** TS 7 for `tsc` and TS 6 (npm alias) for ESLint.
- **Rejected because:** two compilers can disagree, both install a `tsc` binary, and the added
  complexity buys only speed, which is irrelevant for a small project.

### D2. Language-only environment (`lib: ["es2025"]`, `types: []`)

- **Reason:** The starter is about TypeScript the language; host APIs are environment concerns.
- **Alternative:** include `dom` and/or `@types/node` "for convenience".
- **Rejected because:** it would let environment-specific code type-check in a neutral seed. Even
  `console` is excluded; that is a lesson, not an inconvenience.

### D3. `module: "esnext"` + `moduleResolution: "bundler"`

- **Reason:** Standard ESM output with no host-specific resolution semantics.
- **Alternatives:** `nodenext` (Node.js semantics), `preserve` (bundler pass-through), `node10`
  (deprecated).
- **Rejected because:** they encode a specific environment or are deprecated.

### D4. Enable `noUncheckedIndexedAccess`

- **Reason:** `arr[i]` and `record[key]` can be `undefined`; `strict` pretends they cannot.
- **Alternative:** leave it off (the TypeScript default).
- **Rejected because:** it is the single most common source of runtime `undefined` errors that
  `strict` misses. The cost (explicit checks) is the point.

### D5. Enable `exactOptionalPropertyTypes`

- **Reason:** "missing" and "present but `undefined`" behave differently at runtime.
- **Alternative:** off, treating `a?: T` as `a?: T | undefined`.
- **Rejected because:** it hides a real distinction; the explicit form remains available.

### D6. Enable `erasableSyntaxOnly`

- **Reason:** TypeScript as a pure type layer; compatible with type-stripping runtimes.
- **Alternative:** allow `enum`, `namespace`, parameter properties.
- **Rejected because:** these generate runtime code with their own semantics (e.g. numeric enum
  reverse mappings). Literal unions and `as const` objects cover the use cases.

### D7. Enable `isolatedDeclarations`

- **Reason:** Compiler-enforced explicit types on every export.
- **Alternative:** rely only on `explicit-module-boundary-types`.
- **Rejected because:** having the compiler enforce it makes `npm run build` fail too; the lint
  rule remains for cases the compiler permits (inferable literals).

### D8. Enforce explicit variable/parameter/property annotations with `no-restricted-syntax`

- **Reason:** The project's core philosophy (see [explicit-typing.md](explicit-typing.md)).
- **Alternative 1:** `@typescript-eslint/typedef`.
- **Rejected because:** deprecated by typescript-eslint, scheduled for removal.
- **Alternative 2:** follow typescript-eslint guidance (annotate boundaries only, rely on inference).
- **Rejected because:** contradicts the explicit-intent goal of this starter. A project built on it
  may adopt this by deleting the `no-restricted-syntax` block and re-enabling `no-inferrable-types`.

### D9. `explicit-function-return-type` with all exemptions disabled

- **Reason:** Consistency — every function, including callbacks, states its return type.
- **Alternative:** defaults (`allowExpressions`, `allowTypedFunctionExpressions`).
- **Rejected because:** exemptions make the rule depend on context the reader must reconstruct.

### D10. Ban all type assertions (`consistent-type-assertions: never`)

- **Reason:** An assertion overrides the checker. Narrowing (type guards, `in`, `typeof`) or an
  annotation expresses the same intent safely. `as const` remains allowed.
- **Alternative:** `assertionStyle: "as"` + `no-unsafe-type-assertion`.
- **Rejected because:** even "safe" assertions are unnecessary in a starter where you control all
  types. `no-unsafe-type-assertion` is still enabled as a backstop if the style is relaxed.

### D11. `noInlineConfig: true` (no `eslint-disable`)

- **Reason:** Rules are changed centrally and visibly, never per line.
- **Alternative:** allow disables with required descriptions (`@eslint-community/eslint-comments`).
- **Rejected because:** needs an extra plugin and still allows silencing.
- **Note:** ESLint reports ignored directives as warnings; `--max-warnings 0` makes them fail.

### D12. `@ts-expect-error` allowed only with a description; `@ts-ignore`/`@ts-nocheck` banned

- **Reason:** `@ts-expect-error` fails when the error disappears, so it cannot rot silently, and
  is occasionally needed to document a deliberate compiler error.
- **Alternative:** ban all `@ts-*` comments.
- **Rejected because:** `@ts-expect-error` with a reason is the least-bad escape and is useful when
  documenting compiler behaviour while learning.

### D13. Keep both compiler and lint unused-variable checks

- **Reason:** compiler checks make `build` fail; the lint rule additionally covers unused `catch`
  bindings and forbids `_`-prefixed escapes.
- **Alternative:** only one of them.
- **Rejected because:** duplicates are cheap; gaps are not.

### D14. `strict-boolean-expressions` with every `allow*` option off

- **Reason:** `if (count)` conflates `0` with "missing". Write `count !== 0` or `name !== ""`.
- **Alternative:** defaults (allow strings, numbers, nullable objects).
- **Rejected because:** truthiness is exactly the kind of implicit behaviour this project avoids.

### D15. Include Prettier; do not include `eslint-config-prettier`

- **Reason:** formatting should be automatic; no enabled ESLint rule concerns layout.
- **Alternative:** no formatter, or ESLint stylistic rules.
- **Rejected because:** manual formatting wastes time; `@stylistic` adds config without benefit.

### D16. Exact versions + `package-lock.json`

- **Reason:** reproducible strictness and supply-chain safety (see [dependencies.md](dependencies.md)).
- **Alternative:** caret ranges (`^`).
- **Rejected because:** a minor release can add rules to `strictTypeChecked` and change results
  without any change in your code.

### D17. ESLint config in JavaScript (`eslint.config.js`), not TypeScript

- **Reason:** no extra dependency (`jiti`) and no second tsconfig for config files. `// @ts-check`
  still gives editor type checking.
- **Alternative:** `eslint.config.ts`.
- **Rejected because:** requires `jiti` and would need to be included in a TS program.

### D18. `"type": "module"` in `package.json`

- **Reason:** `.js` files (configs, emitted output) are ECMAScript modules — the language standard.
- **Alternative:** `.mjs` file extensions.
- **Rejected because:** one setting is clearer than special extensions. This is package metadata
  read by tooling, not a dependency on Node.js APIs.

## Considered but intentionally not enabled

| Rule / option                                                       | Why not                                                                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@ts-eslint/typedef`                                                | Deprecated (D8)                                                                                      |
| `@ts-eslint/prefer-readonly-parameter-types`                        | Extremely noisy; requires deep `readonly` on every parameter type including library types            |
| `no-magic-numbers`                                                  | Flags `0`, `1`, array indices; makes tiny examples unreadable                                        |
| `@ts-eslint/init-declarations`                                      | Annotations are already required; forcing initialisation fights `let` + definite assignment analysis |
| `@ts-eslint/member-ordering`, `sort-type-constituents`, `sort-keys` | Ordering preferences, not correctness                                                                |
| `@ts-eslint/no-type-alias`                                          | Deprecated; type aliases are fundamental                                                             |
| `@ts-eslint/max-params`, `complexity`                               | Project-specific judgement                                                                           |
| `@ts-eslint/class-methods-use-this`                                 | Opinionated about class design                                                                       |
| `@ts-eslint/prefer-destructuring`                                   | Conflicts with explicit annotation of destructured variables                                         |
| `@ts-eslint/no-unsafe-enum-*` extra config                          | Enums are banned by `erasableSyntaxOnly`                                                             |
| `stableTypeOrdering`                                                | Migration aid, not a safety rule                                                                     |
| `eslint-plugin-import`, `unicorn`, `sonarjs`, …                     | Extra dependencies; overlap with the compiler; not TypeScript-language specific                      |
