type BootFatalListener = () => void;

let bootFatal: string | null = null;
const listeners = new Set<BootFatalListener>();

export function formatBootError(error: unknown): string {
  if (error instanceof Error) {
    const stack = error.stack?.split("\n").slice(0, 8).join("\n").trim();
    return stack ? `${error.message}\n\n${stack}` : error.message;
  }
  return String(error ?? "Unknown error");
}

export function getBootFatal(): string | null {
  return bootFatal;
}

export function subscribeBootFatal(listener: BootFatalListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Update the already-mounted BootShell. A second registerRootComponent is a no-op on native. */
export function reportBootFatal(message: string): void {
  bootFatal = message;
  listeners.forEach((listener) => listener());
}
