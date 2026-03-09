// TypeScript global type declarations for custom globalThis properties

export {};

declare global {
  // Cache for properties API
  var __PROPERTIES_API_CACHE__: Map<string, { data: any; timestamp: number; stale?: boolean }>;
  var __PROPERTIES_API_CACHE_TTL__: number;
}
