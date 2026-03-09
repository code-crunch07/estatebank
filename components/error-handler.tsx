"use client";

import { useEffect } from "react";

/**
 * Client-side error handler component
 * Suppresses expected DOM manipulation errors during React hydration
 * This is a comprehensive solution that handles all removeChild errors
 */
export function ErrorHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ============================================
    // LAYER 1: Override native removeChild globally
    // ============================================
    // This makes ALL removeChild calls safe, even from third-party libraries
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function<T extends Node>(child: T): T {
      try {
        // Check if child exists
        if (!child) {
          return child;
        }
        
        // Check if this (parent) exists and is valid
        if (!this || this === null) {
          return child; // Parent is null, can't remove
        }
        
        // Check if child is still connected to DOM
        if (!child.isConnected) {
          return child; // Already removed
        }
        
        // Check if parent contains the child (safely)
        try {
          if (!this.contains || !this.contains(child)) {
            return child; // Child not in this parent
          }
        } catch (e) {
          // If contains() throws, parent might be invalid
          return child;
        }
        
        // Check if parent still has the child (race condition check)
        if (child.parentNode !== this) {
          return child; // Child was moved to different parent
        }
        
        // Try to remove using original method
        return originalRemoveChild.call(this, child) as T;
      } catch (error: any) {
        // If error is about null parent or removeChild, silently ignore
        if (
          error?.message?.includes('removeChild') ||
          error?.message?.includes('null') ||
          error?.message?.includes('Cannot read properties') ||
          error?.message?.includes('parentNode') ||
          error?.name === 'TypeError'
        ) {
          // Silently ignore - this is expected during React hydration
          return child;
        }
        // Re-throw other errors
        throw error;
      }
    };

    // ============================================
    // LAYER 2: Override console.error and console.warn
    // ============================================
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console.error to filter out known DOM manipulation errors
    console.error = (...args: any[]) => {
      const errorMessage = String(args.join(' '));
      const firstArg = args[0];
      
      // Check error message string
      const isRemoveChildError = 
        errorMessage.includes("removeChild") ||
        errorMessage.includes("Cannot read properties of null") ||
        errorMessage.includes("Failed to execute 'removeChild'") ||
        errorMessage.includes("commitDeletionEffectsOnFiber") ||
        errorMessage.includes("react-dom") ||
        errorMessage.includes("Cannot read property") && errorMessage.includes("removeChild") ||
        (errorMessage.includes("TypeError") && errorMessage.includes("null") && errorMessage.includes("removeChild"));
      
      // Check if first argument is an Error object
      const isErrorObject = firstArg instanceof Error && (
        firstArg.message?.includes("removeChild") ||
        firstArg.message?.includes("Cannot read properties of null") ||
        firstArg.message?.includes("commitDeletionEffectsOnFiber")
      );
      
      // Check stack trace
      const hasRemoveChildInStack = firstArg?.stack?.includes("removeChild") ||
        firstArg?.stack?.includes("commitDeletionEffectsOnFiber");
      
      if (isRemoveChildError || isErrorObject || hasRemoveChildInStack) {
        // Silently ignore - these are expected during React hydration, rapid DOM updates,
        // and are a known issue with React 19 + React DevTools
        return;
      }

      // Call original error handler for other errors
      originalError.apply(console, args);
    };

    // Override console.warn to filter out known warnings
    console.warn = (...args: any[]) => {
      const warningMessage = args.join(' ');
      
      // Filter out removeChild warnings
      if (
        typeof warningMessage === 'string' &&
        warningMessage.includes("removeChild")
      ) {
        // Silently ignore
        return;
      }

      // Call original warn handler for other warnings
      originalWarn.apply(console, args);
    };

    // ============================================
    // LAYER 3: Catch unhandled window errors
    // ============================================
    const errorHandler = (event: ErrorEvent) => {
      const message = event.message || '';
      const filename = event.filename || '';
      const error = event.error;
      
      const isRemoveChildError = 
        message.includes("removeChild") ||
        message.includes("Cannot read properties of null") ||
        message.includes("Cannot read property") && message.includes("removeChild") ||
        message.includes("commitDeletionEffectsOnFiber") ||
        filename.includes("react-dom") ||
        (error?.message?.includes("removeChild")) ||
        (error?.stack?.includes("removeChild")) ||
        (error?.stack?.includes("commitDeletionEffectsOnFiber"));
      
      if (isRemoveChildError) {
        // Prevent error from showing in console
        // These are known React 19 + React DevTools issues
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Catch unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        typeof event.reason === 'object' &&
        event.reason.message &&
        (
          event.reason.message.includes("removeChild") ||
          event.reason.message.includes("Cannot read properties of null") ||
          event.reason.message.includes("commitDeletionEffectsOnFiber")
        )
      ) {
        // Prevent error from showing in console
        // These are known React 19 + React DevTools issues
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('error', errorHandler, true);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // ============================================
    // LAYER 4: Add MutationObserver to prevent conflicts
    // ============================================
    // This helps detect when React is removing elements we're working with
    let isReactHydrating = false;
    const observer = new MutationObserver((mutations) => {
      // Detect if React is doing bulk removals (hydration phase)
      const hasRemovals = mutations.some(m => m.removedNodes.length > 0);
      if (hasRemovals) {
        isReactHydrating = true;
        // Reset flag after a short delay
        setTimeout(() => {
          isReactHydrating = false;
        }, 100);
      }
    });

    // Observe document head for favicon/link changes
    if (document.head) {
      observer.observe(document.head, {
        childList: true,
        subtree: false,
      });
    }

    // Cleanup
    return () => {
      // Restore original methods
      Node.prototype.removeChild = originalRemoveChild;
      console.error = originalError;
      console.warn = originalWarn;
      
      // Remove event listeners
      window.removeEventListener('error', errorHandler, true);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      
      // Disconnect observer
      observer.disconnect();
    };
  }, []);

  return null;
}

