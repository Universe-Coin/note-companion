import React, { useEffect, useRef, useState } from "react";
import { MarkdownRenderer, MarkdownView, TFile } from "obsidian";
import { logger } from "../../../../services/logger";
import { usePlugin } from "../../provider";

interface MarkdownContentProps {
  content: string;
  className?: string;
  children?: React.ReactNode;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className = "",
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const plugin = usePlugin();
  const [activeFile, setActiveFile] = useState<TFile | null>(null);
  const [renderedContent, setRenderedContent] = useState("");

  // Link click handler
  useEffect(() => {
    if (!contentRef.current) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const linkEl = target.closest("a");

      if (!linkEl) return;

      const href = linkEl.getAttribute("href");
      if (!href) return;

      if (href.startsWith("http://") || href.startsWith("https://")) {
        return;
      }

      e.preventDefault();

      let linktext = href;
      if (href.startsWith("[[")) {
        linktext = href.replace(/^\[\[/, "").replace(/\]\]$/, "");
      }

      void plugin.app.workspace.openLinkText(
        linktext,
        activeFile?.path || "",
        e.ctrlKey || e.metaKey
      );
    };

    contentRef.current.addEventListener("click", handleLinkClick);
    return () => {
      contentRef.current?.removeEventListener("click", handleLinkClick);
    };
  }, [plugin.app, activeFile, contentRef.current]);

  // Markdown rendering
  useEffect(() => {
    const renderMarkdown = async () => {
      if (!plugin.app) return;

      try {
        const leaf = plugin.app.workspace.getMostRecentLeaf();
        const tempContainer = plugin.app.workspace.containerEl.createDiv({
          cls: "markdown-content-temp-render",
        });

        if (leaf?.view instanceof MarkdownView) {
          await MarkdownRenderer.render(
            plugin.app,
            content,
            tempContainer,
            leaf.view.file?.path || "",
            leaf.view
          );
        } else {
          await MarkdownRenderer.render(
            plugin.app,
            content,
            tempContainer,
            activeFile?.path || ""
          );
        }

        // Tighten loose lists: unwrap <p> from inside <li> to remove extra spacing
        const listItems = tempContainer.querySelectorAll("li");
        listItems.forEach((li) => {
          const children = Array.from(li.children);
          if (children.length === 1 && children[0].tagName === "P") {
            const paragraph = children[0];
            while (paragraph.firstChild) {
              li.appendChild(paragraph.firstChild);
            }
            paragraph.remove();
          }
        });

        setRenderedContent(tempContainer.innerHTML);
        tempContainer.remove();
      } catch (e) {
        logger.error("Error rendering markdown:", e);
        setRenderedContent(`<p>Error rendering content: ${e instanceof Error ? e.message : String(e)}</p>`);
      }
    };

    void renderMarkdown();
  }, [content, plugin.app]);

  // File tracking
  useEffect(() => {
    if (!plugin.app) return;
    const updateActiveFile = () =>
      setActiveFile(plugin.app.workspace.getActiveFile());
    updateActiveFile();
    const eventRef = plugin.app.workspace.on("file-open", updateActiveFile);
    return () => plugin.app.workspace.offref(eventRef);
  }, [plugin.app]);

  return (
    <div
      className={`markdown-content-wrapper ${className}`}
      style={{ margin: 0, padding: 0 }}
    >
      {children}
      <div
        ref={contentRef}
        className="markdown-rendered select-text"
        style={{ marginTop: 0, paddingTop: 0 }}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
      <style>{`
        .markdown-content-temp-render {
          display: none !important;
        }
        .markdown-content-wrapper .markdown-rendered {
          margin: 0 !important;
          padding: 0 !important;
        }
        .markdown-content-wrapper .markdown-rendered > *:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        .markdown-content-wrapper .markdown-rendered p:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        .markdown-content-wrapper .markdown-rendered p {
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        .markdown-content-wrapper .markdown-rendered ul,
        .markdown-content-wrapper .markdown-rendered ol {
          margin-top: 0.25em !important;
          margin-bottom: 0.25em !important;
          padding-left: 1.5em !important;
        }
        .markdown-content-wrapper .markdown-rendered li {
          margin-top: 0 !important;
          margin-bottom: 0.1em !important;
        }
        .markdown-content-wrapper .markdown-rendered li > p {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
};
