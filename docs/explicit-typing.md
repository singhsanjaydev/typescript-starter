# 9. Explicit typing philosophy

> If TypeScript knows something automatically, that does not necessarily mean the developer should
> omit it.

## Why require annotations TypeScript could infer?

1. **Intent vs accident.** An inferred type describes what the code _happens_ to produce. An
   annotation states what it is _supposed_ to produce. When they disagree, the compiler reports
   the bug at the declaration, not three files away.
2. **Learning.** Writing the type forces you to know it. Reading code tells you the type without
   hovering in an editor.
3. **Stable boundaries.** A function's return type does not silently change when its body does.
4. **Widening surprises.** `let mode = "dark"` is `string`; you might have meant `"dark" | "light"`.

The cost is verbosity. That trade-off is deliberate for this starter and is documented in
[decisions.md](decisions.md) so it can be relaxed per project.

## Examples

```ts
// ❌ Invalid — intentionally. The purpose is to demonstrate the rule.
const username = "Sanjay";
// no-restricted-syntax: Explicit type required: annotate the variable

// ✅ Valid
const username: string = "Sanjay";
```

```ts
// ❌ Invalid — intentionally. The purpose is to demonstrate the rule.
function double(value: number) {
  return value * 2;
}
// explicit-function-return-type: Missing return type on function

// ✅ Valid
function double(value: number): number {
  return value * 2;
}
```

```ts
// ❌ Invalid — intentionally. Callback parameters and return types are not exempt.
const doubled: number[] = [1, 2].map((n) => n * 2);

// ✅ Valid
const doubled: number[] = [1, 2].map((n: number): number => n * 2);
```

```ts
// ❌ Invalid — intentionally.
class Counter {
  count = 0;
}

// ✅ Valid
class Counter {
  public count: number = 0;
}
```

## How explicit typing is enforced

| Location                                        | Enforced by                                               | Layer    |
| ----------------------------------------------- | --------------------------------------------------------- | -------- |
| Values that would be `any`                      | `noImplicitAny`                                           | compiler |
| Exported declarations                           | `isolatedDeclarations`, `explicit-module-boundary-types`  | both     |
| Function / method / arrow return types          | `explicit-function-return-type` (all exemptions disabled) | lint     |
| Variables (`const`, `let`, destructuring)       | `no-restricted-syntax` selector on `VariableDeclarator`   | lint     |
| Parameters (plain, default, destructured, rest) | `no-restricted-syntax` selectors on function `params`     | lint     |
| Class properties and accessors                  | `no-restricted-syntax` selector on `PropertyDefinition`   | lint     |
| Member accessibility                            | `explicit-member-accessibility`                           | lint     |
| Type-only imports                               | `verbatimModuleSyntax`, `consistent-type-imports`         | both     |
| Overrides                                       | `noImplicitOverride`                                      | compiler |

`@typescript-eslint/no-inferrable-types` is **disabled**: it does the opposite (reports
`const n: number = 1` as redundant).

### Why `no-restricted-syntax` instead of `@typescript-eslint/typedef`?

`typedef` is the only dedicated rule for this, but typescript-eslint has **deprecated** it and will
remove it in a future major version. `no-restricted-syntax` is a stable ESLint core rule that bans
AST patterns described by selectors; the project uses it to ban "declaration without type
annotation", with a custom message.

## Where annotations are not required (and why)

| Place                                  | Reason                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `for (const item of items)` / `for…in` | TypeScript does not allow annotations there; the iterable's type governs.                                                 |
| `catch (error)`                        | Only `unknown`/`any` are allowed; `useUnknownInCatchVariables` makes it `unknown`.                                        |
| Generic type arguments at call sites   | `map<number>(…)` duplicates the explicitly annotated callback; `no-unnecessary-type-arguments` even flags redundant ones. |
| `as const`                             | A const assertion is a statement of intent, not an override, so it is permitted.                                          |

## Limitations

- The selectors are syntactic. They check _that_ an annotation exists, not that it is the most
  precise type — the compiler checks correctness.
- Object-literal method shorthand (`{ run(x) {} }`) is covered via `FunctionExpression`.
