import { useEffect, useRef, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { useOthers } from "@liveblocks/react";

export function useAutoSave(editor: Editor | null, projectId: string) {
  const lastSavedContent = useRef<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const others = useOthers();

  const saveContent = useCallback(async () => {
    if (!editor) return;

    const currentContent = JSON.stringify(editor.getJSON());
    if (currentContent === lastSavedContent.current) return;

    try {
      const response = await fetch("/api/save-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          content: editor.getJSON(),
        }),
      });

      if (response.ok) {
        lastSavedContent.current = currentContent;
        console.log("Content auto-saved");
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [editor, projectId]);

  // Auto-save every 30 seconds when content changes
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(saveContent, 30000);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editor, saveContent]);

  // Save when last user disconnects
  useEffect(() => {
    if (others.length === 0) {
      saveContent();
    }
  }, [others.length, saveContent]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editor) {
        navigator.sendBeacon(
          "/api/save-project",
          JSON.stringify({
            projectId,
            content: editor.getJSON(),
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editor, projectId]);
}
