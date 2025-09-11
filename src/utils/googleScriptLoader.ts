// Enhanced singleton pattern for Google script loading
// This version completely avoids DOM manipulation issues
class GoogleScriptLoader {
  private static instance: GoogleScriptLoader;
  private scriptPromise: Promise<void> | null = null;
  private isLoaded = false;
  private scriptElement: HTMLScriptElement | null = null;
  private loadListeners: Array<() => void> = [];
  private errorListeners: Array<(event: Event) => void> = [];

  private constructor() {}

  public static getInstance(): GoogleScriptLoader {
    if (!GoogleScriptLoader.instance) {
      GoogleScriptLoader.instance = new GoogleScriptLoader();
    }
    return GoogleScriptLoader.instance;
  }

  public loadScript(): Promise<void> {
    // If already loaded and Google API is available, return immediately
    if (this.isLoaded && window.google?.accounts?.id) {
      return Promise.resolve();
    }

    // If script is currently loading, return the existing promise
    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    // Create new loading promise
    this.scriptPromise = new Promise((resolve, reject) => {
      // Check if script already exists in DOM
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement;
      
      if (existingScript) {
        this.scriptElement = existingScript;
        
        // Script exists but might not be loaded yet
        if (window.google?.accounts?.id) {
          this.isLoaded = true;
          resolve();
        } else {
          // Wait for script to load
          const onLoad = () => {
            this.isLoaded = true;
            this.cleanupListeners();
            resolve();
          };
          
          const onError = (event: Event) => {
            this.cleanupListeners();
            reject(new Error('Failed to load existing Google script'));
          };

          this.loadListeners.push(onLoad);
          this.errorListeners.push(onError);
          
          existingScript.addEventListener('load', onLoad);
          existingScript.addEventListener('error', onError);
        }
        return;
      }

      // Create and load new script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      // Store reference to script element
      this.scriptElement = script;
      
      const onLoad = () => {
        this.isLoaded = true;
        this.cleanupListeners();
        resolve();
      };
      
      const onError = (event: Event) => {
        this.cleanupListeners();
        reject(new Error('Failed to load Google script'));
      };

      this.loadListeners.push(onLoad);
      this.errorListeners.push(onError);
      
      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);

      // Append to document head
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }

  private cleanupListeners(): void {
    if (this.scriptElement) {
      this.loadListeners.forEach(listener => {
        this.scriptElement?.removeEventListener('load', listener);
      });
      this.errorListeners.forEach(listener => {
        this.scriptElement?.removeEventListener('error', listener);
      });
    }
    this.loadListeners = [];
    this.errorListeners = [];
  }

  public isScriptLoaded(): boolean {
    return this.isLoaded && !!window.google?.accounts?.id;
  }

  public reset(): void {
    // Don't remove the script from DOM - just reset our state
    // This prevents the removeChild error
    this.scriptPromise = null;
    this.isLoaded = false;
    this.cleanupListeners();
    this.scriptElement = null;
  }

  // Method to safely check if we can use Google API
  public isGoogleAPIAvailable(): boolean {
    return typeof window !== 'undefined' && 
           !!window.google?.accounts?.id &&
           this.isLoaded;
  }
}

export default GoogleScriptLoader;
