"use client";

import { useEffect } from "react";
import { useThreads } from "@liveblocks/react/suspense";
import {
  AnchoredThreads,
  FloatingComposer,
  FloatingThreads,
} from "@liveblocks/react-tiptap";
import type { Editor } from "@tiptap/react";

export function Threads({ editor }: { editor: Editor | null }) {
  const { threads } = useThreads({ query: { resolved: false } });

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-liveblocks-theme", "mutualdeskapp");
    style.textContent = `
      .threads-right {
        position: absolute;
        top: 0;
        right: 12px;
        bottom: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 280px;
        pointer-events: auto;
        z-index: 60;
      }

      .threads-right .lb-anchored-thread,
      .threads-right .lb-floating-thread,
      .threads-right .lb-floating-composer {
        margin-left: auto;
      }

      .threads-right .lb-floating-composer {
        margin-right: 8px;
      }

      .lb-root {
        --lb-accent: #248232;
        --lb-accent-light: #2ba84a;
        --lb-text: #040f0f;
        --lb-text-light: #2d3a3a;
        --lb-background: #fcfffc;
        --lb-background-light: #f0f4f8;
        --lb-border: #2d3a3a20;
      }

      .lb-anchored-thread, .lb-floating-thread {
        border-color: var(--lb-border);
        background-color: var(--lb-background);
        z-index: 50;
      }

      .lb-composer-input {
        color: var(--lb-text);
        background-color: var(--lb-background);
      }

      .lb-button-primary {
        background-color: var(--lb-accent);
        color: #fcfffc;
      }

      .lb-button-primary:hover {
        background-color: var(--lb-accent-light);
      }

      .lb-anchored-threads-container {
        position: relative;
        z-index: 40;
      }

      .lb-floating-threads {
        z-index: 45;
      }

      .lb-floating-composer {
        z-index: 45;
      }

      .lb-comment-mark {
        background-color: rgba(36, 130, 50, 0.1);
        border-bottom: 2px solid #248232;
        cursor: pointer;
      }
      .lb-tooltip {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="threads-right">
      <AnchoredThreads editor={editor} threads={threads} />
      <FloatingThreads editor={editor} threads={threads} />
      <FloatingComposer editor={editor} />
    </div>
  );
}
