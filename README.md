# expo-router + exactOptionalPropertyTypes

Minimal reproduction showing that `expo-router@55.0.3` types are incompatible with TypeScript's [`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes).

## Reproduce

[Open in StackBlitz](https://stackblitz.com/github/YevheniiKotyrlo/str-expo-router-eopt) (run `npx tsc --noEmit` in the terminal)

Or locally:

```bash
git clone https://github.com/YevheniiKotyrlo/str-expo-router-eopt.git
cd str-expo-router-eopt
npm install
npx tsc --noEmit
```

**Expected:** 0 errors
**Actual:** 3 errors (TS2375, TS2345) in consumer code — even with `skipLibCheck: true`

```
repro.tsx(19,7): error TS2375: Type '{ name: string; options: ... | undefined; }' is not assignable
  to type 'ScreenProps' with 'exactOptionalPropertyTypes: true'.
repro.tsx(32,3): error TS2375: Type '{ name: string; redirect: undefined; ... }' is not assignable
  to type 'Partial<ScreenProps>' with 'exactOptionalPropertyTypes: true'.
repro.tsx(48,15): error TS2345: Argument of type '{ pathname: string; params: undefined; }' is not
  assignable to parameter of type 'string | HrefObject'.
```

### With `skipLibCheck: false`

```bash
npx tsc --noEmit --skipLibCheck false
```

**144 errors** across `expo-router`, `@react-navigation`, and `react-native` `.d.ts` files.

### Without the flag (baseline)

```bash
npx tsc --noEmit --exactOptionalPropertyTypes false
```

**0 errors** — confirms `exactOptionalPropertyTypes` is the sole cause.

## What's happening

With `exactOptionalPropertyTypes`, `prop?: T` means "if present, must be exactly `T`" — explicitly passing `undefined` is a type error. The fix is `prop?: T | undefined`.

expo-router's exported types (`ScreenProps`, `HrefObject`, etc.) define optional properties as `prop?: T` without `| undefined`. Consumer code that assigns `undefined` to these properties — a common pattern for conditional options — gets type errors.

`skipLibCheck: true` doesn't help because the errors are in the **consumer's `.tsx` files**, not in `.d.ts` files. TypeScript still loads and enforces the types from `.d.ts` declarations.

## Why this matters now

- **TypeScript 5.9's `tsc --init` enables `exactOptionalPropertyProperties` by default**
- Libraries commonly used with Expo have already shipped support: [Zustand](https://github.com/pmndrs/zustand/blob/main/tsconfig.json), [TanStack Query](https://github.com/TanStack/query/pull/8186), [Zod v4](https://github.com/colinhacks/zod/releases/tag/v4.3.0), [Storybook](https://github.com/storybookjs/storybook/releases/tag/v10.2.0)
- [react-navigation](https://github.com/react-navigation/react-navigation/pull/12990) has PRs in review adding the same support

## Fix

Add `| undefined` to optional properties in expo-router's type definitions. This is backwards-compatible: `prop?: T` and `prop?: T | undefined` are identical when `exactOptionalPropertyTypes` is disabled.

See [expo/expo#43506](https://github.com/expo/expo/pull/43506).

## Environment

- expo: 55.0.3
- expo-router: 55.0.3
- react-native: 0.83.2
- react: 19.2.0
- typescript: 5.9.3
- expo-doctor: 17/17 checks passed
