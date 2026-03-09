"use client";

import { useEffect, useState } from "react";

/**
 * Error Diagnostics Component
 * Helps identify the source of removeChild errors
 */
export function ErrorDiagnostics() {
  const [errors, setErrors] = useState<Array<{
    message: string;
    source: string;
    stack?: string;
    timestamp: Date;
  }>>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  // Check if we're in development mode
  useEffect(() => {
    setIsDevelopment(
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('localhost'))
    );
  }, []);

  // Error tracking effect - must be called before any conditional returns
  useEffect(() => {
    if (!isEnabled) return;

    // Store original error handler
    const originalError = console.error;
    const originalWarn = console.warn;

    // Track errors
    const errorHandler = (event: ErrorEvent) => {
      if (
        event.message &&
        (
          event.message.includes("removeChild") ||
          event.message.includes("Cannot read properties of null")
        )
      ) {
        const errorInfo = {
          message: event.message,
          source: event.filename || "unknown",
          stack: event.error?.stack,
          timestamp: new Date(),
        };

        setErrors((prev) => [...prev, errorInfo]);

        // Log detailed info
        console.group("🔍 removeChild Error Detected");
        console.log("Message:", event.message);
        console.log("Source File:", event.filename);
        console.log("Line:", event.lineno);
        console.log("Column:", event.colno);
        console.log("Stack:", event.error?.stack);
        console.log("Target:", event.target);
        console.log("Is Trusted:", event.isTrusted);
        console.groupEnd();
      }
    };

    // Track promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        typeof event.reason === 'object' &&
        event.reason.message &&
        (
          event.reason.message.includes("removeChild") ||
          event.reason.message.includes("Cannot read properties of null")
        )
      ) {
        const errorInfo = {
          message: event.reason.message,
          source: "Promise Rejection",
          stack: event.reason.stack,
          timestamp: new Date(),
        };

        setErrors((prev) => [...prev, errorInfo]);

        console.group("🔍 removeChild Promise Rejection");
        console.log("Reason:", event.reason);
        console.log("Stack:", event.reason.stack);
        console.groupEnd();
      }
    };

    // Override console.error to track
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      
      if (
        typeof errorMessage === 'string' &&
        (
          errorMessage.includes("removeChild") ||
          errorMessage.includes("Cannot read properties of null")
        )
      ) {
        const errorInfo = {
          message: errorMessage,
          source: "console.error",
          stack: new Error().stack,
          timestamp: new Date(),
        };

        setErrors((prev) => [...prev, errorInfo]);

        console.group("🔍 removeChild Console Error");
        console.log("Message:", errorMessage);
        console.log("Arguments:", args);
        console.log("Stack:", new Error().stack);
        console.groupEnd();
      }

      // Call original
      originalError.apply(console, args);
    };

    window.addEventListener('error', errorHandler, true);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', errorHandler, true);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, [isEnabled]);

  // Early return after all hooks are called
  if (!isDevelopment) {
    return null; // Don't show in production
  }

  // Check for browser extensions
  const checkExtensions = () => {
    const checks = {
      reactDevTools: false,
      adBlockers: false,
      otherExtensions: [] as string[],
    };

    // Check for React DevTools
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      checks.reactDevTools = true;
    }

    // Check for common ad blockers
    const adBlockSelectors = [
      '#adblock',
      '.adblock',
      '[class*="adblock"]',
      '[id*="adblock"]',
    ];

    adBlockSelectors.forEach((selector) => {
      try {
        if (document.querySelector(selector)) {
          checks.adBlockers = true;
        }
      } catch (e) {
        // Ignore
      }
    });

    // Check for injected scripts
    const scripts = Array.from(document.scripts);
    scripts.forEach((script) => {
      if (
        script.src &&
        (
          script.src.includes('extension://') ||
          script.src.includes('chrome-extension://') ||
          script.src.includes('moz-extension://')
        )
      ) {
        checks.otherExtensions.push(script.src);
      }
    });

    return checks;
  };

  if (!isEnabled) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: '#fff',
        border: '2px solid #f00',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '300px',
      }}>
        <button
          onClick={() => setIsEnabled(true)}
          style={{
            padding: '8px 16px',
            background: '#f00',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🔍 Enable Error Diagnostics
        </button>
        <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
          Click to track removeChild errors
        </p>
      </div>
    );
  }

  const extensionChecks = checkExtensions();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: '#fff',
      border: '2px solid #0070f3',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>🔍 Error Diagnostics</h3>
        <button
          onClick={() => {
            setIsEnabled(false);
            setErrors([]);
          }}
          style={{
            padding: '4px 8px',
            background: '#f00',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Close
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Browser Extensions:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
          <li>React DevTools: {extensionChecks.reactDevTools ? '✅ Detected' : '❌ Not detected'}</li>
          <li>Ad Blockers: {extensionChecks.adBlockers ? '✅ Detected' : '❌ Not detected'}</li>
          {extensionChecks.otherExtensions.length > 0 && (
            <li>Other Extensions: {extensionChecks.otherExtensions.length} found</li>
          )}
        </ul>
      </div>

      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          Errors Captured: {errors.length}
        </h4>
        {errors.length > 0 && errors[0]?.source?.includes('react-dom') && (
          <div style={{
            padding: '8px',
            marginBottom: '12px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '11px',
          }}>
            <strong>⚠️ React DevTools Issue Detected</strong>
            <p style={{ margin: '4px 0 0 0', color: '#856404' }}>
              These errors are from React DOM itself, not your code. This is a known issue with React 19 + React DevTools. 
              <br />
              <strong>Solution:</strong> Disable React DevTools extension or ignore (errors are suppressed).
            </p>
          </div>
        )}
        {errors.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#666' }}>
            No errors detected yet. Navigate around the app to trigger errors.
          </p>
        ) : (
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {errors.map((error, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  background: '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  Error #{index + 1}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Message:</strong> {error.message.substring(0, 100)}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Source:</strong> {error.source}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {error.timestamp.toLocaleTimeString()}
                </div>
                {error.stack && (
                  <details style={{ marginTop: '4px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '10px' }}>Stack Trace</summary>
                    <pre style={{
                      fontSize: '9px',
                      overflow: 'auto',
                      maxHeight: '100px',
                      background: '#fff',
                      padding: '4px',
                      marginTop: '4px',
                    }}>
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setErrors([])}
        style={{
          marginTop: '12px',
          padding: '6px 12px',
          background: '#666',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          width: '100%',
        }}
      >
        Clear Errors
      </button>
    </div>
  );
}

