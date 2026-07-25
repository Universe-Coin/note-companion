import React, { useRef, useState } from "react";
import { Notice, TFile } from "obsidian";
import { resolveFile } from "./resolve-file";
import { useContextItems } from "../use-context-items";
import { ToolHandlerProps } from "./types";

interface DeleteFilesArgs {
  filePaths: string[];
  reason?: string;
}

export function DeleteFilesHandler({
  toolInvocation,
  handleAddResult,
  app,
}: ToolHandlerProps) {
  const hasFetchedRef = useRef(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [validFiles, setValidFiles] = useState<TFile[]>([]);
  const [invalidPaths, setInvalidPaths] = useState<string[]>([]);

  React.useEffect(() => {
    const validateFiles = () => {
      if (!hasFetchedRef.current && !("result" in toolInvocation)) {
        hasFetchedRef.current = true;
        const { filePaths } = toolInvocation.args as DeleteFilesArgs;

        const valid: TFile[] = [];
        const invalid: string[] = [];
        const seenPaths = new Set<string>();

        for (const path of filePaths) {
          const file = resolveFile(app, path);
          if (file instanceof TFile) {
            if (!seenPaths.has(file.path)) {
              seenPaths.add(file.path);
              valid.push(file);
            }
          } else {
            invalid.push(path);
          }
        }

        setValidFiles(valid);
        setInvalidPaths(invalid);
      }
    };

    validateFiles();
  }, [toolInvocation, app]);

  const handleConfirmDelete = async () => {
    const results: Array<{ path: string; success: boolean; error?: string }> = [];
    let deletedCount = 0;
    let failedCount = 0;

    for (const file of validFiles) {
      try {
        await app.fileManager.trashFile(file);
        results.push({ path: file.path, success: true });
        deletedCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        results.push({
          path: file.path,
          success: false,
          error: errorMessage,
        });
        failedCount++;
      }
    }

    setIsDone(true);

    const message = `Moved ${deletedCount} file(s) to trash`;

    const resultMessage =
      failedCount > 0
        ? `${message}, ${failedCount} failed`
        : message;

    new Notice(resultMessage);

    const deletedPaths = new Set(
      results.filter((r) => r.success).map((r) => r.path)
    );
    if (deletedPaths.size > 0) {
      const store = useContextItems.getState();
      deletedPaths.forEach((path) => store.removeItem("file", path));
      if (store.currentFile && deletedPaths.has(store.currentFile.path)) {
        store.setCurrentFile(null);
      }
    }

    handleAddResult(
      JSON.stringify({
        success: true,
        deleted: deletedCount,
        failed: failedCount,
        message: resultMessage,
        errors: results.filter((r) => !r.success).map((r) => `${r.path}: ${r.error}`),
      })
    );
  };

  const handleCancel = () => {
    setIsDone(true);
    handleAddResult(
      JSON.stringify({
        success: false,
        message: "User cancelled deletion",
      })
    );
  };

  const { reason } = toolInvocation.args as DeleteFilesArgs;
  const isComplete = "result" in toolInvocation;

  if (isComplete || isDone) {
    return (
      <div className="text-sm border-b border-[--background-modifier-border] pb-2">
        <div className="text-[--text-success] text-xs">
          {isDone && !isConfirmed ? "✗ Deletion cancelled" : "✓ Files deleted"}
        </div>
      </div>
    );
  }

  if (validFiles.length === 0 && invalidPaths.length > 0) {
    return (
      <div className="text-sm border-b border-[--background-modifier-border] pb-2">
        <div className="text-[--text-error] text-xs">
          ✗ No valid files to delete. All paths were invalid.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 border border-[--background-modifier-border]">
      <div className="flex items-start gap-2">
        <span className="text-[--text-error] text-lg">⚠</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-[--text-normal] mb-1">
            Confirm Deletion
          </div>
          <div className="text-xs text-[--text-muted] mb-2">{reason}</div>
        </div>
      </div>

      <div className="text-xs space-y-1">
        <div className="font-semibold text-[--text-muted] uppercase">
          Files to delete ({validFiles.length})
        </div>
        {validFiles.slice(0, 5).map((file) => (
          <div key={file.path} className="text-[--text-normal] pl-2">
            • {file.basename}
          </div>
        ))}
        {validFiles.length > 5 && (
          <div className="text-[--text-faint] pl-2">
            ...and {validFiles.length - 5} more
          </div>
        )}
      </div>

      {invalidPaths.length > 0 && (
        <div className="text-xs text-[--text-error]">
          ⚠ {invalidPaths.length} invalid path(s) will be skipped
        </div>
      )}

      <div className="p-2 bg-[--background-secondary] text-xs text-[--text-warning]">
        Files will be moved to trash (can be recovered)
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          className="flex-1 px-3 py-1.5 text-xs border border-[--background-modifier-border] hover:bg-[--background-modifier-hover] text-[--text-normal]"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setIsConfirmed(true);
            void handleConfirmDelete();
          }}
          className="flex-1 px-3 py-1.5 text-xs bg-[--text-error] hover:opacity-90 text-white"
        >
          Delete {validFiles.length} File{validFiles.length !== 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}
