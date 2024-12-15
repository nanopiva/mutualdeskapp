"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

export default function RealtimePlugin({ projectId }: { projectId: string }) {
  const [editor] = useLexicalComposerContext();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    const supabase = createClient();
    const subscription = supabase
      .channel(`projects:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          const newContent = payload.new.content;
          if (newContent) {
            const newState = editor.parseEditorState(
              JSON.stringify(newContent)
            );
            editor.setEditorState(newState);
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [editor, projectId]);

  return null;
}
