
/**
 * Utility functions for working with API requests
 */

/**
 * Fetch with timeout functionality
 * @param url The URL to fetch
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise resolving to the fetch response
 */
export const fetchWithTimeout = async (
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = 10000
): Promise<Response> => {
  // Create abort controller to handle timeout
  const controller = new AbortController();
  const { signal } = controller;
  
  // Create timeout promise
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  // Create fetch promise with abort signal
  const fetchPromise = fetch(url, {
    ...options,
    signal
  });
  
  // Race between the fetch and timeout
  return Promise.race([fetchPromise, timeout]) as Promise<Response>;
};

/**
 * Generic function to retry a failed API request with exponential backoff
 * @param fn The async function to retry
 * @param retries Number of retries
 * @param delay Delay between retries in ms (increases exponentially)
 * @param onRetry Optional callback on retry
 * @returns Promise resolving to the function result
 */
export const retryAsync = async<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    if (onRetry) {
      onRetry(retries, error as Error);
    }
    
    // Wait for the specified delay with exponential backoff
    const backoffDelay = delay * (2 ** (3 - retries));
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
    
    // Try again with one less retry
    return retryAsync(fn, retries - 1, delay, onRetry);
  }
};

/**
 * Execute a promise with a fallback in case of failure
 * @param mainPromise The main promise to execute
 * @param fallbackFn Function to call if the main promise fails
 * @returns Promise resolving to either the main promise result or fallback result
 */
export const withFallback = async<T>(
  mainPromise: Promise<T>,
  fallbackFn: () => Promise<T> | T
): Promise<T> => {
  try {
    return await mainPromise;
  } catch (error) {
    console.error("Main promise failed, using fallback:", error);
    return fallbackFn();
  }
};

