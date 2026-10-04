# Overview

## 1. Project purpose

This repository is a **starter seed**: a pre-configured, extremely strict environment for writing
TypeScript. It exists so that you can begin writing TypeScript immediately — for learning or as the
foundation of a future project — without first spending hours researching configuration.

It **is**:

- a `tsconfig.json` tuned for maximum reasonable strictness;
- a type-aware ESLint configuration that enforces explicit developer intent;
- a Prettier setup so formatting is never a discussion;
- documentation explaining every decision.

It **is not**:

- an application, library, CLI, API, website, or demo;
- a Node.js project, browser project, or framework project;
- a tutorial or a set of solved exercises;
- a testing setup.

`src/index.ts` contains a single line whose only purpose is to give the tools something to check.

## 2. Why TypeScript?

JavaScript is dynamically typed: the type of a value is only known while the program runs, so many
mistakes (calling a method that does not exist, passing a string where a number was expected,
forgetting `undefined`) surface only at runtime.

TypeScript adds a **static type system** on top of JavaScript. The TypeScript compiler (`tsc`) has
two independent jobs:

1. **Type checking** — analyse the program _without running it_ and report code whose types do not
   line up.
2. **Emitting** — remove the type syntax and write plain JavaScript (`.js`), optionally declaration
   files (`.d.ts`) and source maps.

Crucially, types are **erased**. They do not exist at runtime, do not change program behaviour, and
do not validate data at runtime. TypeScript tells you, _before_ you run anything, whether your
program is consistent with the types you wrote.

## 3. TypeScript vs environment APIs

A programming language and the environment that runs it are different things.

| Layer                 | Examples                                                     | Where it is typed                    |
| --------------------- | ------------------------------------------------------------ | ------------------------------------ |
| Language (ECMAScript) | `Array`, `Map`, `Promise`, `JSON`, `Math`, `RegExp`, `Intl`  | `lib: ["es2025"]` ← **this project** |
| Browser / Web APIs    | `document`, `window`, `fetch`, `HTMLElement`, `localStorage` | `lib: ["dom"]`                       |
| Node.js APIs          | `process`, `Buffer`, `fs`, `require`, `__dirname`            | `@types/node` + `types`              |
| Host utilities        | `console`, `setTimeout`                                      | `dom` or `@types/node`               |
| Frameworks            | React, Vue, Express                                          | their own packages                   |

This project configures only the **language** layer. The consequences are deliberate:

```ts
// ❌ Invalid — intentionally. The purpose is to demonstrate environment neutrality.
console.log("hi");
// error TS2584: Cannot find name 'console'. Do you need to change your target library?
```

`console` is not part of the ECMAScript specification; it is provided by browsers and Node.js. In a
language-only starter it does not exist. The same applies to `setTimeout`, `fetch`, `document`, and
`process`.

### Adding an environment later

When a project built on this starter targets a concrete environment, add the environment **to that
project**, not to this seed:

- Browser: `"lib": ["es2025", "dom", "dom.iterable"]`
- Node.js: `npm install -D @types/node` and `"types": ["node"]`
- A framework: follow its official TypeScript guide.

Everything else in the strict configuration remains valid.
