# Dependencies

There are **zero runtime dependencies** (`dependencies` does not exist in `package.json`) and five
development dependencies.

| Package             | Version | Why it exists                                                        | What problem it solves                                                                            | Why TypeScript alone is insufficient                                                        |
| ------------------- | ------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `typescript`        | 6.0.3   | The compiler and type checker (`tsc`)                                | Type checking, emitting JavaScript and `.d.ts`                                                    | — (it _is_ TypeScript)                                                                      |
| `eslint`            | 10.11.0 | The lint engine                                                      | Runs rules that enforce policy over valid code                                                    | `tsc` only proves type-correctness; it cannot ban `any`, assertions, or require annotations |
| `@eslint/js`        | 10.0.1  | ESLint's `recommended` core rule set                                 | Catches JavaScript-level mistakes                                                                 | Same as above; published separately from `eslint` since v9                                  |
| `typescript-eslint` | 8.70.1  | Parser + TypeScript rules + type-aware linting (single meta-package) | Lets ESLint understand TS syntax and query types (`no-unsafe-*`, `strict-boolean-expressions`, …) | `tsc` has no extensible rule system                                                         |
| `prettier`          | 3.9.9   | Formatter                                                            | Deterministic layout, no style debates                                                            | `tsc` does not format; ESLint no longer ships formatting rules                              |

Transitive dependencies (≈90 packages) are recorded in `package-lock.json`.

## Not included (and why)

| Package                                           | Reason                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `@types/node`                                     | Node.js globals would break environment neutrality                     |
| `eslint-config-prettier`                          | Only disables formatting rules; none are enabled                       |
| `tsx`, `ts-node`, bundlers (`esbuild`, `vite`, …) | Executing/bundling is a runtime-environment concern                    |
| Test frameworks                                   | Out of scope                                                           |
| `jiti`                                            | Only needed for `eslint.config.ts`; the config is plain JavaScript     |
| `@stylistic/eslint-plugin`                        | Formatting is Prettier's job                                           |
| `tslib`                                           | Only needed with `importHelpers`; nothing is down-levelled at `es2025` |

## Version policy

- **TypeScript version range:** `6.0.x`. TypeScript 7.0 (the native Go compiler) is the npm
  `latest` tag, but it ships without a stable JavaScript API, and typescript-eslint requires
  `typescript >=4.8.4 <6.1.0`. Type-aware linting is central to this project, so 6.0 is used.
  TypeScript 6.0 and 7.0 have the same language features; 6.0 is the official bridge release.
- **Upgrading to TypeScript 7:** when typescript-eslint publishes support (tracked upstream), bump
  `typescript` and `typescript-eslint` together, then run `npm run check`. No source changes should
  be needed: this configuration already avoids every option deprecated in 6.0.
- **Exact versions.** `package.json` lists exact versions and `.npmrc` has `save-exact=true`.
  Reasons: reproducible strictness (a minor typescript-eslint release can add rules to
  `strictTypeChecked`, and a TypeScript minor can add errors), and supply-chain safety (no version
  is installed that nobody has reviewed). `package-lock.json` pins the transitive tree.
- **Release age.** New versions are adopted only after they have been public for at least 7 days.
  At creation time this meant `eslint` 10.11.0 rather than 10.12.0 and `typescript-eslint` 8.70.1
  rather than 8.71.0.
- **Updating:** `npm outdated` → `npm install -D <pkg>@<version>` → `npm run check` → read the
  release notes for newly enabled rules.
- **Node.js engines** (`^20.19.0 || ^22.13.0 || >=24`) mirror ESLint 10's requirement, the strictest
  among the tools; `.npmrc` `engine-strict=true` enforces it. `devEngines` declares npm as the
  package manager.
