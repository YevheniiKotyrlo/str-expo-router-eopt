/**
 * Reproduction: expo-router types break with exactOptionalPropertyTypes
 *
 * Run: npm install && npx tsc --noEmit
 *
 * With skipLibCheck: true  → consumer-code errors (TS2375, TS2379)
 * With skipLibCheck: false → additional .d.ts internal errors
 */

import type { ScreenProps } from 'expo-router';

// ---------------------------------------------------------------------------
// 1. Assigning undefined to optional ScreenProps fields
//    Common pattern: conditionally setting screen options
// ---------------------------------------------------------------------------

const showHeader = Math.random() > 0.5;

const screenProps: ScreenProps = {
  name: 'home',
  // TS2375: Type 'undefined' is not assignable to type '...'
  // with exactOptionalPropertyTypes enabled
  options: showHeader ? { title: 'Home' } : undefined,
};

// ---------------------------------------------------------------------------
// 2. Spreading partial objects into ScreenProps
//    Common pattern: merging default and override options
// ---------------------------------------------------------------------------

function getScreenConfig(name: string): Partial<ScreenProps> {
  return {
    name,
    redirect: undefined, // TS2375
    initialParams: undefined, // TS2375
  };
}

// ---------------------------------------------------------------------------
// 3. Using the router with optional params
// ---------------------------------------------------------------------------

import { useRouter } from 'expo-router';

function NavigateExample() {
  const router = useRouter();
  // Common pattern: navigate with optional params
  router.push({
    pathname: '/profile',
    params: undefined, // may error depending on typed routes
  });
}

// Suppress "unused" warnings
void screenProps;
void getScreenConfig;
void NavigateExample;
