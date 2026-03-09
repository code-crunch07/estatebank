# Environment-Based Logging Guide

## What is Environment-Based Logging?

Environment-based logging means logging different levels of information based on the environment (development vs production). This helps:

- **Performance**: Reduce console overhead in production
- **Security**: Avoid logging sensitive data in production
- **Cleaner logs**: Only show important errors/warnings in production
- **Better debugging**: Show detailed logs in development

## How It Works

In Next.js, you can check the environment using `process.env.NODE_ENV`:
- `development` - Local development
- `production` - Production builds
- `test` - Running tests

## Implementation

We've created a `logger` utility at `/lib/logger.ts` that handles this automatically.

### Basic Usage

```typescript
import { logger } from '@/lib/logger';

// Debug logs - only shown in development
logger.debug('Detailed debug information');
logger.debug('Property data:', property);

// Info logs - only shown in development
logger.info('Component mounted');
logger.info('API request started');

// Warnings - always shown (dev + production)
logger.warn('Deprecated API used');
logger.warn('Missing configuration:', config);

// Errors - always shown (dev + production)
logger.error('API request failed:', error);
logger.error('Failed to save property:', error);
```

### Advanced Usage

```typescript
// Custom prefix for component-specific logs
logger.log('PropertyDetailPage', 'Component mounted:', { segment, slug });

// Group related logs together
logger.group('Property Loading', () => {
  logger.debug('Fetching property...');
  logger.debug('Property found:', property);
  logger.debug('Loading images...');
});

// Time operations for performance debugging
logger.time('Property API Call');
// ... your code ...
logger.timeEnd('Property API Call'); // Logs: Property API Call: 123ms
```

## Migration Examples

### Before (Always Logs)

```typescript
// ❌ Old way - always logs, even in production
console.log('[Login] Starting login request...', { email });
console.log('[Login] Response data:', data);
```

### After (Environment-Based)

```typescript
// ✅ New way - only logs in development
import { logger } from '@/lib/logger';

logger.debug('[Login] Starting login request...', { email });
logger.debug('[Login] Response data:', data);

// Keep errors for production
logger.error('Login failed:', error); // Always logged
```

### API Route Example

```typescript
// Before
console.log("[Properties API] Starting request...");
console.log("[Properties API] Returning cached data");
console.error("[Properties API] Error:", error);

// After
import { logger } from '@/lib/logger';

logger.debug("[Properties API] Starting request...");
logger.debug("[Properties API] Returning cached data");
logger.error("[Properties API] Error:", error); // Always logged
```

### Component Example

```typescript
// Before
console.log('[PropertyDetailPage] Component mounted/updated:', { segment, slug });
console.error("Error fetching property:", error);

// After
import { logger } from '@/lib/logger';

logger.debug('[PropertyDetailPage] Component mounted/updated:', { segment, slug });
logger.error("Error fetching property:", error); // Always logged
```

## Log Levels Guide

| Level | When to Use | Shown In |
|-------|-------------|----------|
| `debug` | Detailed debugging info, component lifecycle, API requests | Development only |
| `info` | General information, status updates | Development only |
| `warn` | Warnings, deprecated features, missing configs | Always |
| `error` | Errors, exceptions, failures | Always |

## Benefits

1. **Cleaner Production Logs**: Only see errors and warnings
2. **Better Performance**: No console overhead in production
3. **Security**: Sensitive data (like emails, tokens) only logged in dev
4. **Easier Debugging**: Detailed logs available when you need them

## Migration Strategy

You can migrate gradually:

1. **Start with new code**: Use `logger` for all new code
2. **Migrate high-traffic areas**: API routes, frequently used components
3. **Keep critical errors**: Always log errors, even if using `console.error` directly
4. **Remove verbose logs**: Replace `console.log` with `logger.debug` or remove entirely

## Quick Reference

```typescript
import { logger } from '@/lib/logger';

// Development only
logger.debug('Debug info');
logger.info('Info message');
logger.log('Component', 'Message');

// Always logged
logger.warn('Warning');
logger.error('Error');

// Utilities
logger.group('Label', () => { /* logs */ });
logger.time('Operation');
logger.timeEnd('Operation');
```

## Environment Variables

The logger automatically detects the environment from `process.env.NODE_ENV`:

- **Development**: `npm run dev` → All logs shown
- **Production**: `npm run build && npm start` → Only errors/warnings shown

You can also check manually:

```typescript
import { isLoggingEnabled, getEnvInfo } from '@/lib/logger';

if (isLoggingEnabled()) {
  // Do something only in development
}

const env = getEnvInfo();
// { nodeEnv: 'development', isDevelopment: true, isProduction: false }
```
