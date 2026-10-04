# Documentation index

Read in this order if you are new to the project:

1. [overview.md](overview.md) — what this starter is, why TypeScript, language vs environment APIs.
2. [toolchain.md](toolchain.md) — installing, the scripts, and the compile → run lifecycle.
3. [strictness.md](strictness.md) — the project's definition of "strict".
4. [explicit-typing.md](explicit-typing.md) — why annotations are required even when inferable.
5. [compiler-options.md](compiler-options.md) — every significant `tsconfig.json` option.
6. [eslint.md](eslint.md) — ESLint, typescript-eslint, Prettier, and how they divide the work.
7. [rules-reference.md](rules-reference.md) — every enabled rule with a tiny example.
8. [dependencies.md](dependencies.md) — each dev dependency and the version policy.
9. [decisions.md](decisions.md) — decision log, including alternatives that were rejected.

## Conventions used in examples

- Examples are intentionally tiny and demonstrate **one rule at a time**.
- An example marked **❌ Invalid** is intentionally invalid. The purpose is to demonstrate the rule.
  It is never present in `src/`.
- An example marked **✅ Valid** passes `npm run check`.
