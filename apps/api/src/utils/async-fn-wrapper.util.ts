// Define a generic function type that can take any arguments and return a Promise
type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;

/**
 * Wraps an async function in a try/catch block to catch any errors that occur
 * and log them to the console.
 *
 * @param fn The async function to wrap
 * @returns A new async function that will log any errors that occur
 */

export function asyncFnWrapper<T extends any[], R>(
  fn: AsyncFunction<T, R>,
): (...args: T) => Promise<R | undefined> {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('An error occurred:', error);

      return undefined;
    }
  };
}
