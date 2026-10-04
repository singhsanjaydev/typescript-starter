# Toolchain

## 4. Installation

Prerequisites:

- **Node.js** `^20.19.0 || ^22.13.0 || >=24` — the developer tools (tsc, ESLint, Prettier) are
  JavaScript programs and need a JavaScript runtime. Your code does not target Node.js.
- **npm** `>=10` — the package manager (this repository was built with npm 12).

```sh
npm ci            # install exactly what package-lock.json records
npm run check     # verify everything is valid
```

`.npmrc` sets `engine-strict=true`, so installation fails on an unsupported Node.js/npm version, and
`save-exact=true`, so newly added dependencies are recorded with exact versions.

## Scripts

| Script         | Command                         | Purpose                                                                |
| -------------- | ------------------------------- | ---------------------------------------------------------------------- |
| `typecheck`    | `tsc --noEmit`                  | Type errors only, no files written. Fastest feedback.                  |
| `build`        | `tsc`                           | Type-check and emit `dist/`. Emits nothing on error (`noEmitOnError`). |
| `lint`         | `eslint --max-warnings 0`       | Type-aware lint of the whole repository; warnings fail.                |
| `lint:fix`     | `eslint --max-warnings 0 --fix` | Apply safe auto-fixes, then report the rest.                           |
| `format`       | `prettier --write .`            | Rewrite files into canonical formatting.                               |
| `format:check` | `prettier --check .`            | Fail if any file is not formatted.                                     |
| `check`        | typecheck → lint → format:check | The single "is my code valid?" command.                                |

Names follow the de-facto ecosystem conventions (`typecheck`, `lint`, `format`, `build`), and
`check` is the aggregate gate. `build` is not part of `check` because `typecheck` already performs
the same analysis without writing files.

## 5. Running TypeScript: the lifecycle

```text
write TypeScript (src/*.ts)
        ↓
TypeScript compiler (tsc)  — type-checks, then erases types
        ↓
JavaScript output (dist/*.js, *.d.ts, *.map)
        ↓
JavaScript runtime (browser engine, Node.js, Deno, Bun, …) — executes the JavaScript
```

### What the TypeScript compiler does

- Parses `.ts` files and checks them against the types you declared.
- Reports diagnostics (errors).
- Emits JavaScript with the types removed. With `erasableSyntaxOnly`, emitting is pure removal: no
  TypeScript construct in this project generates runtime code.
- Rewrites relative `./file.ts` imports to `./file.js` (`rewriteRelativeImportExtensions`).
- Emits `.d.ts` declaration files and source maps.

### What the TypeScript compiler does **not** do

- It does not execute code. `tsc` never runs your program.
- It does not add runtime type checks. A value from `JSON.parse` is not validated at runtime.
- It does not polyfill. Targeting `es2025` means the output assumes an ES2025 engine.
- It does not bundle or minify.
- It does not provide environment APIs (`console`, `fetch`, `fs`, …).

### Compiler, runtime, and runtime environment

| Term                | Meaning                                        | Example                          |
| ------------------- | ---------------------------------------------- | -------------------------------- |
| TypeScript compiler | Tool that checks types and produces JavaScript | `tsc`                            |
| JavaScript runtime  | Engine that executes JavaScript                | V8, SpiderMonkey, JavaScriptCore |
| Runtime environment | Engine **plus** host APIs it exposes           | Chrome (DOM), Node.js (`fs`)     |

This starter stops at "JavaScript output". The emitted `dist/index.js` is standard ES module code
that any ES2025-capable runtime can load. Choosing and configuring a runtime environment is the job
of the project you build on top of this seed.

> Some runtimes (Node.js ≥ 22.18 / 23.6, Deno, Bun) can execute `.ts` files directly by stripping
> types. They **do not type-check**. `erasableSyntaxOnly` keeps this code compatible with
> type-stripping, but `npm run check` remains the only source of truth for correctness.
