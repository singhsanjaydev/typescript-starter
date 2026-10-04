# Compiler configuration (`tsconfig.json`)

Every significant option, in the order it appears in `tsconfig.json`. TypeScript 6.0 defaults are
noted where relevant; options are written out explicitly anyway so the file documents itself and
does not silently change meaning if defaults move again.

Format for each entry: **Purpose · Why · Example · Expected compiler behavior**.

---

## Top level

### `include: ["src"]`

- **Purpose:** Which files form the program.
- **Why:** Only `src/` contains TypeScript. Config files are JavaScript and are linted, not compiled.
- **Example:** a file at `scratch/a.ts` is not part of the program.
- **Expected:** `tsc` ignores files outside `src/`.

---

## Language and environment

### `target: "es2025"`

- **Purpose:** The ECMAScript version of the emitted JavaScript.
- **Why:** Latest stable ECMAScript version supported by TypeScript 6.0; no down-levelling means
  the output is your code minus types. (`es5` is deprecated in 6.0.)
- **Example:** `class A { #x: number = 1; }` is emitted unchanged with a native private field.
- **Expected:** no helper code or polyfills in `dist/`.

### `lib: ["es2025"]`

- **Purpose:** Which built-in declarations exist (the global type environment).
- **Why:** Language-only. Excluding `dom` removes `document`, `window`, `fetch`, `console`, …
- **Example (❌ intentionally invalid):** `document.title;`
- **Expected:** `error TS2584/TS2304: Cannot find name 'document'`.

### `types: []`

- **Purpose:** Which `@types/*` packages are loaded globally.
- **Why:** Prevents any installed `@types/node` (e.g. pulled in transitively) from leaking Node.js
  globals into the program. This is the 6.0 default; stated explicitly for clarity.
- **Example (❌ intentionally invalid):** `process.exit(0);`
- **Expected:** `error TS2591: Cannot find name 'process'`.

---

## Modules

### `module: "esnext"`

- **Purpose:** The module format of emitted JavaScript.
- **Why:** Standard ECMAScript modules, the only module system defined by the language. `nodenext`
  would tie semantics to Node.js; `commonjs` is Node-specific; `amd`/`umd`/`system` are deprecated.
- **Example:** `export const a: number = 1;` → `export const a = 1;`
- **Expected:** ESM output (`import`/`export`).

### `moduleResolution: "bundler"`

- **Purpose:** How import specifiers are resolved to files.
- **Why:** The only modern non-Node-specific mode (`node10` and `classic` are deprecated). It honours
  `package.json` `exports`/`imports` without imposing Node's CommonJS interop rules.
- **Limitation:** it permits extensionless relative imports (`./util`). Prefer writing `./util.ts`
  (see `rewriteRelativeImportExtensions`) so the output is valid in every ESM runtime.

### `moduleDetection: "force"`

- **Purpose:** Treat every file as a module, even without `import`/`export`.
- **Why:** Without it, a file with no imports/exports is a global script and its top-level names
  collide with other script files.
- **Example:** two files each declaring `const count: number = 0;` with no exports.
- **Expected:** no "Cannot redeclare block-scoped variable" error; each file has its own scope.

### `verbatimModuleSyntax: true`

- **Purpose:** Imports/exports are emitted exactly as written; type-only imports must say so.
- **Why:** Makes it explicit which imports exist at runtime. Also implies `isolatedModules`-style
  per-file safety.
- **Example (❌ intentionally invalid):** `import { Shape } from "./shape.ts";` where `Shape` is a type.
- **Expected:** `error TS1484: 'Shape' is a type and must be imported using a type-only import`.
  Fix: `import type { Shape } from "./shape.ts";`

### `rewriteRelativeImportExtensions: true`

- **Purpose:** Rewrite `./x.ts` to `./x.js` in emitted code.
- **Why:** Lets source files reference the real file on disk (`.ts`) while producing output that
  works in any spec-compliant ESM loader, which requires full file paths.
- **Example:** `import { a } from "./a.ts";` → emitted `import { a } from "./a.js";`

### `noUncheckedSideEffectImports: true`

- **Purpose:** Error when a side-effect import (`import "./setup.ts";`) cannot be resolved.
- **Why:** Otherwise typos in side-effect imports are silently ignored. Default `true` in 6.0.
- **Expected:** `error TS2882: Cannot find module or type declarations for side-effect import`.

### `resolveJsonModule: false`

- **Purpose:** Disallow `import data from "./data.json"`.
- **Why:** JSON modules require import attributes and host support; not a language-only concern.

### `erasableSyntaxOnly: true`

- **Purpose:** Ban TypeScript syntax that generates runtime code: `enum`, `namespace` with values,
  parameter properties (`constructor(private x: number)`), `import x = require()`.
- **Why:** Keeps TypeScript a pure type layer over JavaScript: removing the types yields the
  program. Matches TypeScript's direction and runtimes that strip types.
- **Example (❌ intentionally invalid):** `enum Color { Red }`
- **Expected:** `error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled`.
  Alternative: `type Color = "red" | "green";`

---

## JavaScript interop

### `allowJs: false`, `checkJs: false`

- **Purpose:** Whether `.js` files participate in the program / are type-checked.
- **Why:** This is a TypeScript-only project; there is no JavaScript source to migrate.
- **Expected:** `.js` files under `src/` are ignored by `tsc`.

---

## Type checking — the `strict` family

### `strict: true`

Enables the family below (and any future strict options). Default `true` in 6.0; stated anyway.

| Option                         | What it catches                                                          | ❌ Intentionally invalid example                                    | Expected error |
| ------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------- |
| `noImplicitAny`                | Values whose type silently becomes `any`                                 | `function f(x) {}`                                                  | TS7006         |
| `strictNullChecks`             | `null`/`undefined` are separate types                                    | `const n: number = null;`                                           | TS2322         |
| `strictFunctionTypes`          | Contravariant checking of function-typed parameters (parameter variance) | `const f: (x: string \| number) => void = (x: string): void => {};` | TS2322         |
| `strictBindCallApply`          | Correct argument types for `bind`/`call`/`apply`                         | `Math.max.call(null, "1");`                                         | TS2345         |
| `strictPropertyInitialization` | Class properties must be initialised                                     | `class A { public x: number; }`                                     | TS2564         |
| `strictBuiltinIteratorReturn`  | Built-in iterator results typed `undefined` instead of `any` when done   | `const v: string = new Set<string>().values().next().value;`        | TS2322         |
| `noImplicitThis`               | `this` with an implicit `any` type                                       | `function f(): void { this.x = 1; }`                                | TS2683         |
| `useUnknownInCatchVariables`   | `catch (e)` is `unknown`, not `any`                                      | `catch (e) { e.message; }`                                          | TS18046        |
| `alwaysStrict`                 | Emit/parse in JavaScript strict mode (`false` is deprecated in 6.0)      | `with (obj) {}`                                                     | TS1101         |

---

## Type checking — beyond `strict`

### `noUncheckedIndexedAccess: true`

- **Purpose:** Indexed access (`arr[i]`, `record[key]`) includes `undefined`.
- **Why:** The index might not exist; `strict` alone assumes it always does.
- **Example (❌ intentionally invalid):**
  ```ts
  const scores: number[] = [1, 2, 3];
  const first: number = scores[0];
  ```
- **Expected:** `error TS2322: Type 'number | undefined' is not assignable to type 'number'`.

### `exactOptionalPropertyTypes: true`

- **Purpose:** `prop?: T` means "may be absent", **not** "may be `undefined`".
- **Why:** Distinguishes a missing property from one explicitly set to `undefined`
  (they differ for `in`, `Object.keys`, spread).
- **Example (❌ intentionally invalid):**
  ```ts
  interface Profile {
    nickname?: string;
  }
  const p: Profile = { nickname: undefined };
  ```
- **Expected:** `error TS2375`. Write `nickname?: string | undefined` if `undefined` is intended.

### `noPropertyAccessFromIndexSignature: true`

- **Purpose:** Keys that come from an index signature must use bracket access.
- **Why:** `obj.key` signals "this property definitely exists"; `obj["key"]` signals "dynamic key".
- **Example (❌ intentionally invalid):**
  ```ts
  const settings: Record<string, string> = {};
  const theme: string | undefined = settings.theme;
  ```
- **Expected:** `error TS4111: Property 'theme' comes from an index signature`.

### `noImplicitReturns: true`

- **Purpose:** Every code path of a function with a return value must return.
- **Example (❌ intentionally invalid):**
  ```ts
  function f(flag: boolean): number {
    if (flag) {
      return 1;
    }
  }
  ```
- **Expected:** `error TS2366` / `TS7030: Not all code paths return a value`.

### `noImplicitOverride: true`

- **Purpose:** Overriding a base-class member requires the `override` keyword.
- **Why:** Makes overriding explicit; catches accidental overrides and renamed base methods.
- **Example (❌ intentionally invalid):**
  ```ts
  class A {
    public run(): void {}
  }
  class B extends A {
    public run(): void {}
  }
  ```
- **Expected:** `error TS4114: This member must have an 'override' modifier`.

### `noFallthroughCasesInSwitch: true`

- **Purpose:** A non-empty `case` must end with `break`/`return`/`throw`.
- **Example (❌ intentionally invalid):** `case 1: x = 1; case 2: x = 2;`
- **Expected:** `error TS7029: Fallthrough case in switch`.

### `noUnusedLocals: true`, `noUnusedParameters: true`

- **Purpose:** Unused local declarations / parameters are errors.
- **Why:** Dead code is either a bug or noise. Also checked by ESLint (see `eslint.md`); the
  compiler check ensures `npm run build` fails even without lint.
- **Example (❌ intentionally invalid):** `function f(): void { const x: number = 1; }`
- **Expected:** `error TS6133: 'x' is declared but its value is never read`.

### `allowUnreachableCode: false`

- **Purpose:** Code after `return`/`throw` is an error (default is a suggestion only).
- **Example (❌ intentionally invalid):** `return 1; const x: number = 2;`
- **Expected:** `error TS7027: Unreachable code detected`.

### `allowUnusedLabels: false`

- **Purpose:** Unused labels are errors.
- **Why:** A stray label is almost always a mistyped object literal: `() => { value: 1 }`.
- **Expected:** `error TS7028: Unused label`.

### `isolatedDeclarations: true`

- **Purpose:** Exports must carry enough explicit type information to generate `.d.ts` files
  without type inference.
- **Why:** The compiler-level form of "be explicit at module boundaries".
- **Example (❌ intentionally invalid):** `export function add(a: number, b: number) { return a + b; }`
- **Expected:** `error TS9007: Function must have an explicit return type annotation with --isolatedDeclarations`.
- **Note:** trivially inferable literals (`export const n = 1;`) are allowed by the compiler; the
  lint rule `no-restricted-syntax` closes that gap.

### `forceConsistentCasingInFileNames: true`

- **Purpose:** `import "./User.ts"` and `import "./user.ts"` cannot both refer to one file.
- **Why:** Prevents code that works on case-insensitive file systems (macOS, Windows) but breaks on
  case-sensitive ones (Linux).

### `skipLibCheck: false`

- **Purpose:** Type-check every `.d.ts` file, including those in `node_modules`.
- **Why:** Strict and cheap here (there are no library declarations beyond `lib.es2025`). Projects
  with many dependencies sometimes set `true` for speed; that is a trade-off, not a fix.

---

## Emit

| Option           | Value    | Purpose / Why                                                                                        |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `rootDir`        | `"src"`  | Mirror `src/` into `dist/` (6.0 default is the tsconfig directory, which would produce `dist/src/`). |
| `outDir`         | `"dist"` | Generated output lives in one ignored directory.                                                     |
| `declaration`    | `true`   | Emit `.d.ts` files; required by `isolatedDeclarations`.                                              |
| `declarationMap` | `true`   | Editors can jump from a `.d.ts` to the `.ts` source.                                                 |
| `sourceMap`      | `true`   | Debuggers/runtimes map `.js` back to `.ts` lines.                                                    |
| `noEmitOnError`  | `true`   | A program with type errors produces **no** output, so invalid code cannot be shipped.                |
| `newLine`        | `"lf"`   | Identical output on every operating system.                                                          |

## Diagnostics

### `noErrorTruncation: true`

- **Purpose:** Print complete types in error messages instead of `...`.
- **Why:** For learning, the full type is the most informative part of an error.

---

## Evaluated and intentionally not set

| Option                                             | Reason                                                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `stableTypeOrdering`                               | A 6.0 → 7.0 migration aid with a performance cost; not a safety rule.                          |
| `allowImportingTsExtensions`                       | Requires `noEmit`; `rewriteRelativeImportExtensions` gives the same authoring style with emit. |
| `module: "nodenext"` / `"preserve"`                | `nodenext` encodes Node.js semantics; `preserve` targets bundlers. Neither is neutral.         |
| `isolatedModules`                                  | Implied by `verbatimModuleSyntax` for the cases that matter.                                   |
| `esModuleInterop` / `allowSyntheticDefaultImports` | CommonJS interop concerns; defaults are fine (setting them `false` is deprecated).             |
| `baseUrl` / `paths`                                | `baseUrl` is deprecated; path aliases are a bundler/runtime concern.                           |
| `importHelpers`                                    | Requires the `tslib` runtime dependency; unnecessary at `es2025`.                              |
| `composite` / `incremental`                        | Project references / build caching are not needed for a single small project.                  |
| `experimentalDecorators`, `emitDecoratorMetadata`  | Legacy decorators; standard decorators need no flag.                                           |
| `noEmit: true` (globally)                          | `build` would be impossible; `typecheck` passes `--noEmit` on the command line instead.        |
| `libReplacement`                                   | Default `false` in 6.0; only relevant to custom `lib` packages.                                |
