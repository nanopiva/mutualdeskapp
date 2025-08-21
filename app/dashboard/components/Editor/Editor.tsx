"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import ImageResize from "tiptap-extension-resize-image";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { FontSizeExtension } from "@/extensions/font-size";
import { LineHeightExtension } from "@/extensions/line-height";
import { useStorage } from "@liveblocks/react";
import { Ruler } from "./Ruler";
import { Threads } from "../../my-projects/[projectId]/threads";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { useEditorStore } from "./use-editor-store";
import { useEffect, useRef } from "react";
import { useAutoSave } from "@/app/hooks/use-auto-save";

export default function Editor({ projectId }: { projectId: string }) {
  const setEditorInStore = useEditorStore((s) => s.setEditor);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const leftMargin = useStorage((root) => root.leftMargin) ?? 56;
  const rightMargin = useStorage((root) => root.rightMargin) ?? 56;

  const liveblocks = useLiveblocksExtension({
    initialContent: "",
    offlineSupport_experimental: true,
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      liveblocks,
      StarterKit.configure({
        history: false,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ImageResize,
      Underline,
      FontFamily,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontSizeExtension,
      LineHeightExtension,
    ],
  });

  useAutoSave(editor, projectId);

  useEffect(() => {
    setEditorInStore(editor ?? null);
    return () => {
      setEditorInStore(null);
      editor?.destroy?.();
    };
  }, [editor, setEditorInStore]);

  const handleContainerPointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!editor) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const PAGE_WIDTH = rect.width;

    if (clickX < leftMargin || clickX > PAGE_WIDTH - rightMargin) {
      return;
    }

    const coords = { left: e.clientX, top: e.clientY };
    const posResult = editor.view.posAtCoords(coords as any);

    if (posResult && typeof posResult.pos === "number") {
      editor.commands.setTextSelection({
        from: posResult.pos,
        to: posResult.pos,
      });
      editor.commands.focus();
    } else {
      editor.commands.focus("end");
    }
  };

  return (
    <div className="size-full overflow-x-auto bg-[var(--white)]">
      <div className="relative">
        <div className="min-w-[1064px] flex justify-center w-full py-4 print:py-0 print:bg-white print:min-w-0">
          <div className="flex flex-col page-wrapper min-h-[1056px] w-[816px] print:min-h-0 print:shadow-none bg-[var(--white)] shadow-sm print:w-full">
            <Ruler />

            <div
              ref={containerRef}
              onPointerDown={handleContainerPointerDown}
              className="flex-1 overflow-hidden focus-within:outline-none print:border-0 bg-[var(--white)] border border-[var(--input-border)] flex flex-col min-h-[1054px] w-[816px] pt-10 pb-10 cursor-text text-[var(--black)]"
              style={{
                paddingLeft: `${leftMargin}px`,
                paddingRight: `${rightMargin}px`,
              }}
            >
              <EditorContent
                editor={editor}
                className="editor-surface h-full outline-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        <Threads editor={editor} />
      </div>

      <style jsx global>{`
        .editor-surface {
          color: var(--black);
        }
        .editor-surface ::selection {
          background: color-mix(in srgb, var(--light-green) 60%, transparent);
          color: var(--white);
        }

        .editor-surface p {
          line-height: 1.5;
        }
        .editor-surface h1,
        .editor-surface h2,
        .editor-surface h3,
        .editor-surface h4,
        .editor-surface h5,
        .editor-surface h6 {
          color: var(--black);
        }

        .editor-surface a {
          color: var(--link-color);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .editor-surface a:hover {
          color: var(--link-hover);
        }

        .editor-surface ul:not([data-type="taskList"]) {
          list-style: disc outside;
          padding-left: 1.25rem;
          margin: 0.75rem 0;
        }
        .editor-surface ol {
          list-style: decimal outside;
          padding-left: 1.25rem;
          margin: 0.75rem 0;
        }
        .editor-surface li {
          margin: 0.125rem 0;
          color: var(--black);
        }

        .editor-surface ul:not([data-type="taskList"]) > li::marker {
          content: "•  ";
          color: var(--black);
        }
        .editor-surface ol > li::marker {
          content: counter(list-item) ". ";
          color: var(--black);
        }

        .editor-surface ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        .editor-surface ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin: 0.25rem 0;
        }
        .editor-surface ul[data-type="taskList"] li > label {
          margin-right: 0.5rem;
          user-select: none;
        }
        .editor-surface ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
        .editor-surface .task-list-item {
          list-style: none;
        }
        .editor-surface .task-list-item input[type="checkbox"] {
          accent-color: var(--strong-green);
        }

        .editor-surface table {
          border-collapse: collapse;
          width: 100%;
        }
        .editor-surface th,
        .editor-surface td {
          border: 1px solid var(--input-border);
          padding: 6px 8px;
        }
        .editor-surface th {
          background: color-mix(in srgb, var(--gray) 8%, var(--white));
          text-align: left;
        }

        .editor-surface img {
          max-width: 100%;
          height: auto;
          display: inline-block;
        }

        .editor-surface pre {
          background: color-mix(in srgb, var(--gray) 6%, var(--white));
          border: 1px solid var(--input-border);
          border-radius: 6px;
          padding: 10px 12px;
          overflow-x: auto;
        }
        .editor-surface blockquote {
          border-left: 3px solid var(--input-border);
          padding-left: 10px;
          color: var(--gray);
        }

        .editor-surface .is-empty::before {
          color: var(--gray);
        }

        .editor-surface::-webkit-scrollbar {
          height: 10px;
          width: 10px;
        }
        .editor-surface::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--gray) 25%, transparent);
          border-radius: 6px;
        }
        .editor-surface::-webkit-scrollbar-track {
          background: color-mix(in srgb, var(--gray) 8%, transparent);
        }
      `}</style>
    </div>
  );
}
