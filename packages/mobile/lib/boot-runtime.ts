type BootFatalListener = () => void;

let bootFatal: string | null = null;
const listeners = new Set<BootFatalListener>();

/** EAS paths wrap 4+ times on a phone and hide the useful frames. */
function compactStackLine(line: string): string {
  return line
    .trim()
    .replace(/\/Users\/expo\/workingdir\/build\/[^:\s]+\/main\.jsbundle/g, "main.jsbundle")
    .replace(/\/Users\/[^:\s]+\/main\.jsbundle/g, "main.jsbundle");
}

export function formatBootError(error: unknown): string {
  if (error instanceof Error) {
    const frames = (error.stack ?? "")
      .split("\n")
      .map(compactStackLine)
      .filter(Boolean)
      .slice(0, 16);
    if (frames.length === 0) return error.message;
    if (frames[0]?.includes(error.message)) return frames.join("\n");
    return `${error.message}\n\n${frames.join("\n")}`;
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
