# ESLint, typescript-eslint, and Prettier

## 7. Who does what

| Tool                   | Question it answers                                       | Knows about types?            |
| ---------------------- | --------------------------------------------------------- | ----------------------------- |
| **TypeScript (`tsc`)** | "Is this program type-correct?"                           | Yes — it _is_ the type system |
| **ESLint**             | "Does this code follow our rules / avoid risky patterns?" | No (on its own)               |
| **typescript-eslint**  | Lets ESLint parse TypeScript and ask `tsc` for type info  | Yes, via the TypeScript API   |
| **Prettier**           | "What should this code look like?" (layout only)          | No                            |

### What TypeScript does

The compiler proves type-correctness: assignability, null-safety, exhaustive returns, unused code,
and so on. It cannot express **policy**: "never use `any`", "always annotate variables", "never
assert types". All of those are _type-correct_ code, so `tsc` accepts them.

### What ESLint does

ESLint walks the syntax tree of each file and runs **rules** against it. Rules encode policy and
patterns: `==` vs `===`, missing braces, banned syntax, suspicious constructs.

### What typescript-eslint does

1. **Parser** — converts TypeScript source into an ESTree-compatible syntax tree ESLint understands.
2. **Plugin** — ~130 TypeScript-specific rules.
3. **Type-aware linting** — with `parserOptions.projectService: true`, rules can ask the
   TypeScript compiler for the _type_ of any expression. That powers rules such as
   `no-unsafe-assignment`, `strict-boolean-expressions`, and `switch-exhaustiveness-check`, which
   are impossible from syntax alone.

### Why both TypeScript and ESLint

**Compiler-enforced restrictions** concern type correctness and are configured in `tsconfig.json`.
They affect `npm run typecheck` and `npm run build` (nothing is emitted on error).

**Lint-enforced restrictions** concern _how_ correct code is written — explicitness, banned escape
hatches, suspicious-but-valid patterns. They are configured in `eslint.config.js` and affect
`npm run lint`.

```ts
// ✅ tsc accepts this — it is type-correct.
// ❌ ESLint rejects it — `any` defeats the type system (no-explicit-any).
// This is intentionally invalid. The purpose is to demonstrate the distinction.
export function toText(value: any): string {
  return String(value);
}
```

## Configuration style

`eslint.config.js` uses ESLint's **flat config** (the only format in ESLint 10; `.eslintrc*` is
removed) with `defineConfig` / `globalIgnores` from `eslint/config`, the officially recommended
helpers.

```text
globalIgnores(dist/, node_modules/)
linterOptions        → noInlineConfig, report unused directives/inline configs as errors
**/*.ts              → @eslint/js recommended
                       + typescript-eslint strictTypeChecked
                       + typescript-eslint stylisticTypeChecked
                       + project rules (see rules-reference.md)
**/*.js              → @eslint/js recommended (config files only; not type-aware)
```

### Presets

- `js.configs.recommended` — ESLint core rules for genuine bugs (`no-undef`-class problems are
  disabled by typescript-eslint for `.ts` because the compiler handles them).
- `tseslint.configs.strictTypeChecked` — superset of `recommended` + `strict`, with type info.
  The most opinionated, bug-focused preset typescript-eslint publishes.
- `tseslint.configs.stylisticTypeChecked` — consistent TypeScript idioms (e.g. `Record<K, V>` vs
  index signatures, `??` over `||`). These are **not** formatting rules.

### `linterOptions`

- `noInlineConfig: true` — `// eslint-disable…` and `/* eslint rule: off */` comments are ignored.
  Rules cannot be silenced per line; if a rule is wrong, change it in `eslint.config.js` where the
  decision is visible and reviewed.
- `reportUnusedDisableDirectives: "error"` and `reportUnusedInlineConfigs: "error"` — leftover
  directives are reported. Combined with `noInlineConfig`, ESLint warns about any disable comment;
  `--max-warnings 0` turns that warning into a failure.

### Type-aware parsing

```js
parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname }
```

`projectService` is the current recommended way to enable type information: ESLint uses the same
TypeScript project service that editors use, picking up `tsconfig.json` automatically.

## Formatting: Prettier

**Included**, because a strict project should not spend review time on whitespace.

- **Why separate from ESLint:** ESLint and typescript-eslint have removed their formatting rules
  (moved to the separate `@stylistic` project). Formatting is a different problem from linting:
  Prettier reprints the whole file deterministically; linters judge code meaning.
- **No conflicts:** none of the enabled ESLint presets contain layout rules, so
  `eslint-config-prettier` is unnecessary. `curly: "all"` is compatible with Prettier (Prettier
  never adds or removes braces).
- **Configuration:** `prettier.config.js` only sets `printWidth: 100`; all other options are
  Prettier defaults. `.prettierignore` excludes `dist/` and `package-lock.json`.
- `npm run format:check` is part of `npm run check`.
