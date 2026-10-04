# typescript-starter

A **framework-free, environment-neutral, super-strict TypeScript starter seed**.

It gives you a strict playground — compiler, linter, formatter, and documentation explaining every
decision. It deliberately contains no application code: you write the TypeScript.

## 1. What this repository is

- A minimal, modern toolchain for writing **pure TypeScript** (the language, not a platform).
- A compiler configuration that goes well beyond `"strict": true`.
- A type-aware ESLint configuration that enforces what the compiler cannot, including **explicit
  type annotations** where TypeScript would otherwise infer them.
- A reference library (`docs/`) explaining what each option does and why it was chosen.

## 2. What this repository is not

- Not an application, website, API, CLI, library, or demo project.
- Not a Node.js, browser/DOM, React, or any other framework/runtime project.
- Not a tutorial: there are no exercises, algorithms, or example programs.
- Not a test setup: no test framework is included.

## 3. Design philosophy

1. **Language only.** Only ECMAScript built-ins are typed (`lib: ["es2025"]`, `types: []`). Even
   `console` is unavailable, because it is a host API, not part of JavaScript.
2. **Make intent explicit.** If TypeScript can infer something, that does not mean the developer
   should omit it. Variables, parameters, class properties, and return types are annotated.
3. **No escape hatches.** `any`, `@ts-ignore`, `@ts-nocheck`, type assertions (`as T`, `<T>x`),
   non-null assertions (`x!`), and `eslint-disable` comments are all rejected.
4. **Every rule has a reason.** See [docs/rules-reference.md](docs/rules-reference.md) and
   [docs/decisions.md](docs/decisions.md).
5. **Minimal dependencies.** Five dev dependencies, zero runtime dependencies.

## 4. Prerequisites

| Tool    | Version                            | Why                                             |
| ------- | ---------------------------------- | ----------------------------------------------- |
| Node.js | `^20.19.0 \|\| ^22.13.0 \|\| >=24` | Runs the _tooling_ (tsc, ESLint, Prettier) only |
| npm     | `>=10` (developed with npm 12)     | Package manager                                 |
| Git     | any recent version                 | Version control                                 |

Node.js is required to run the developer tools; your TypeScript code does not target Node.js.

## 5. Installation

```sh
git clone <your-copy-of-this-repo> my-project
cd my-project
npm ci
```

Use `npm ci` (installs exactly what `package-lock.json` records). Use `npm install` only when you
intentionally change dependencies.

## 6. Available commands

| Command                | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm run typecheck`    | Type-checks `src/` with `tsc --noEmit` (no output files)       |
| `npm run build`        | Compiles `src/` to `dist/` (`.js`, `.d.ts`, source maps)       |
| `npm run lint`         | Runs type-aware ESLint; any warning fails (`--max-warnings 0`) |
| `npm run lint:fix`     | Same as `lint`, applying safe auto-fixes                       |
| `npm run format`       | Formats all files with Prettier                                |
| `npm run format:check` | Verifies formatting without writing                            |
| `npm run check`        | **The one command:** `typecheck` → `lint` → `format:check`     |

> "Is my TypeScript code valid according to this project's rules?" → `npm run check`

## 7. Project structure

```text
.
├── src/
│   └── index.ts          # one-line placeholder that proves the configuration works
├── docs/                 # configuration reference (see below)
├── eslint.config.js      # ESLint flat config (typescript-eslint, type-aware)
├── prettier.config.js    # Prettier options
├── tsconfig.json         # compiler configuration
├── package.json          # scripts + pinned dev dependencies
├── package-lock.json     # exact dependency tree
├── .npmrc                # npm behaviour (exact versions, engine checks)
├── .prettierignore       # files Prettier must not touch
├── .gitignore
└── README.md
```

Generated, ignored by Git: `node_modules/` (dependencies) and `dist/` (compiler output).

## 8. Strictness philosophy (summary)

- **Compiler-enforced** (`tsconfig.json`): `strict` plus `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnused*`, `allowUnreachableCode: false`,
  `allowUnusedLabels: false`, `isolatedDeclarations`, `erasableSyntaxOnly`, `verbatimModuleSyntax`…
- **Lint-enforced** (`eslint.config.js`): `strictTypeChecked` + `stylisticTypeChecked`, explicit
  annotations everywhere, no assertions, no `any`, `strict-boolean-expressions`, exhaustive
  `switch`, no inline lint configuration…

Full explanation: [docs/strictness.md](docs/strictness.md).

## 9. Documentation

| Document                                             | Topic                                                 |
| ---------------------------------------------------- | ----------------------------------------------------- |
| [docs/overview.md](docs/overview.md)                 | Purpose, why TypeScript, language vs environment APIs |
| [docs/toolchain.md](docs/toolchain.md)               | Install, scripts, `.ts → tsc → .js → runtime`         |
| [docs/compiler-options.md](docs/compiler-options.md) | Every significant `tsconfig.json` option              |
| [docs/eslint.md](docs/eslint.md)                     | ESLint vs TypeScript vs typescript-eslint, Prettier   |
| [docs/strictness.md](docs/strictness.md)             | What "strict" means in this project                   |
| [docs/explicit-typing.md](docs/explicit-typing.md)   | Why and how explicit annotations are required         |
| [docs/rules-reference.md](docs/rules-reference.md)   | Every enabled rule: category, reason, example         |
| [docs/dependencies.md](docs/dependencies.md)         | Each dev dependency and the version policy            |
| [docs/decisions.md](docs/decisions.md)               | Decision log with rejected alternatives               |

## 10. Using the starter for a new TypeScript project

1. Copy the repository (clone, or "Use this template"), then reset history if you want:
   `rm -rf .git && git init`.
2. Change `name` and `description` in `package.json`.
3. Run `npm ci`.
4. Replace `src/index.ts` with your own code. Add files under `src/`.
5. Run `npm run check` often (or wire it into your editor / CI).
6. If your project later targets a real environment (browser, Node.js, …), add that environment
   **in that project**, e.g. `"lib": ["es2025", "dom"]` or `"types": ["node"]` plus `@types/node`.
   See [docs/overview.md](docs/overview.md#adding-an-environment-later).

## 11. Verifying the configuration works

```sh
npm ci
npm run check   # must print no errors
npm run build   # produces dist/index.js, dist/index.d.ts and maps
```

Then prove the rules bite: add a temporary file `src/scratch.ts` containing

```ts
// This is intentionally invalid.
// The purpose is to demonstrate the rules.
const inferred = "Sanjay";
export const value = inferred as string;
```

`npm run lint` reports `no-restricted-syntax` (missing annotation, twice) and
`consistent-type-assertions` (assertion). Delete the file afterwards.
