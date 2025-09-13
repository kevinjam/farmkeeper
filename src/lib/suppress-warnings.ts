// Suppress known warnings from third-party libraries
// This file should be imported early in the application lifecycle

if (typeof window !== 'undefined') {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;

  // Override console.warn to filter out specific warnings
  console.warn = (...args) => {
    const message = args[0];
    
    // Suppress Recharts defaultProps warning
    if (typeof message === 'string' && message.includes('defaultProps will be removed from function components')) {
      return;
    }
    
    // Suppress other known warnings if needed
    if (typeof message === 'string' && message.includes('XAxis: Support for defaultProps')) {
      return;
    }
    
    // Call original warn for all other messages
    originalWarn.apply(console, args);
  };

  // Override console.error to filter out specific errors if needed
  console.error = (...args) => {
    const message = args[0];
    
    // Add any error filtering here if needed
    
    // Call original error for all other messages
    originalError.apply(console, args);
  };
}
