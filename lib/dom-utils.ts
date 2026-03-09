/**
 * Safe DOM manipulation utilities
 * These functions never throw errors and handle all edge cases
 */

/**
 * Safely remove an element from the DOM
 * This function will never throw an error, even if the element is already removed
 * Uses multiple layers of protection to prevent removeChild errors
 */
export function safeRemoveElement(element: Element | null | undefined): void {
  if (!element) {
    return;
  }

  try {
    // Check if element is still connected to the DOM
    if (!element.isConnected) {
      return; // Already removed
    }

    // Try modern remove() method first (supported in all modern browsers)
    if (typeof element.remove === 'function') {
      try {
        element.remove();
        return; // Successfully removed
      } catch (e) {
        // If remove() fails, fall back to removeChild
        // This can happen in some edge cases
      }
    }

    // Fallback to removeChild with comprehensive checks
    const parent = element.parentNode;
    if (!parent) {
      return; // No parent, element is already removed
    }

    // Triple-check: element is still connected, parent exists, and parent hasn't changed
    if (!element.isConnected || !parent || element.parentNode !== parent) {
      return; // Element was removed by another process
    }

    // Verify parent is still a valid Node
    if (parent.nodeType === undefined || parent.nodeType === null) {
      return; // Invalid parent
    }

    // Verify parent contains the element
    if (!parent.contains || !parent.contains(element)) {
      return; // Element not in parent
    }

    // Final check: ensure parent still has removeChild method
    if (typeof parent.removeChild === 'function') {
      try {
        // One more check right before removal (prevents race conditions)
        if (element.isConnected && element.parentNode === parent && parent.contains(element)) {
          parent.removeChild(element);
        }
      } catch (e) {
        // Silently ignore - element may have been removed by React or another process
        // This is expected during React hydration or rapid DOM updates
        // The global removeChild override in error-handler.tsx will also catch this
      }
    }
  } catch (error) {
    // Ultimate fallback: silently ignore all errors
    // This prevents console noise from race conditions during React hydration
    // The global error handler will also suppress these errors
  }
}

/**
 * Safely remove multiple elements from the DOM
 */
export function safeRemoveElements(elements: NodeListOf<Element> | Element[] | null | undefined): void {
  if (!elements) {
    return;
  }

  // Convert to array to avoid stale NodeList references
  const elementsArray = Array.from(elements);
  
  elementsArray.forEach((element) => {
    safeRemoveElement(element);
  });
}

/**
 * Safely append a child element
 */
export function safeAppendChild(
  parent: Node | null | undefined,
  child: Node | null | undefined
): boolean {
  if (!parent || !child) {
    return false;
  }

  try {
    // Check if parent is still connected (for document.head, this is always true)
    if (parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || parent.isConnected || parent === document.head || parent === document.body) {
      parent.appendChild(child);
      return true;
    }
  } catch (error) {
    // Silently ignore errors
  }

  return false;
}

/**
 * Check if we're in a React hydration phase
 * This helps prevent DOM manipulation during hydration
 */
export function isReactHydrating(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if React is currently hydrating
  // This is a heuristic - React doesn't expose this directly
  const reactRoot = (document as any).__REACT_ROOT__;
  if (reactRoot) {
    return reactRoot.isHydrating === true;
  }

  return false;
}

