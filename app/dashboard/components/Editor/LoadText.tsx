"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef, useState } from "react";
import { loadProjectFromDatabase } from "../../../actions";
import { createClient } from "@/utils/supabase/client";
import { useDebouncedCallback } from "use-debounce";
import { saveProjectInDatabase } from "../../../actions";
import { mergeRegister } from "@lexical/utils";
import { SerializedEditorState } from "lexical";

interface LoadTextProps {
  projectId: string;
  userId: string | null | undefined;
}
export default function LoadText({ projectId, userId }: LoadTextProps) {
  const [editor] = useLexicalComposerContext();
  const supabase = createClient();
  const isLocalUpdate = useRef(false); // Flag for local changes
  const lastContentRef = useRef<JSON | SerializedEditorState | null>(null); // Stores the last content
  const lastSavedContentRef = useRef<JSON | SerializedEditorState | null>(null); // Stores the last saved version

  const broadcastUpdate = (contentJSON: any) => {
    supabase.channel(`editor-broadcast${projectId}`).send({
      type: "broadcast",
      event: "editor-content",
      payload: {
        content: contentJSON,
        clientId: userId,
      },
    });
    console.log("Broadcast sent:", contentJSON);
  };
  const listenToBroadcast = () => {
    supabase
      .channel(`editor-broadcast${projectId}`)
      .on("broadcast", { event: "editor-content" }, (payload) => {
        // Ignore changes sent by this client
        if (
          payload &&
          payload.payload &&
          payload.payload.content &&
          payload.payload.clientId !== userId
        ) {
          const { content } = payload.payload;

          // Mark that the next change should not be retransmitted
          isLocalUpdate.current = true;

          const newState = editor.parseEditorState(content);
          editor.setEditorState(newState);
          console.log("State updated from broadcast.");
        }
      })
      .subscribe();
  };
  useEffect(() => {
    const loadEditorState = async () => {
      try {
        const projectData = await loadProjectFromDatabase(projectId);
        console.log("Loaded content from database:", projectData);
        if (projectData && projectData.length > 0) {
          const { content } = projectData[0];
          const isContentEmpty =
            !content ||
            (typeof content === "object" && Object.keys(content).length === 0);
          if (isContentEmpty) {
            const defaultState = editor.parseEditorState(
              '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'
            );
            editor.setEditorState(defaultState);
          } else {
            const newState = editor.parseEditorState(content);
            editor.setEditorState(newState);
          }
          editor.setEditable(true);
        }
      } catch (error) {
        console.error("Error loading project content:", error);
      }
    };
    loadEditorState();
    editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves }) => {
        if (isLocalUpdate.current) {
          // If the change is remote, reset the flag and don't retransmit
          isLocalUpdate.current = false;
          return;
        }
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
          return;
        }
        const contentJSON = editorState.toJSON();
        lastContentRef.current = contentJSON; // Update current content
        console.log("Local state updated, sending broadcast:", contentJSON); // Save to the database and send broadcast
        broadcastUpdate(contentJSON);
      }
    );
    listenToBroadcast(); // Auto-save every 10 seconds
    const interval = setInterval(() => {
      if (
        lastContentRef.current &&
        lastContentRef.current !== lastSavedContentRef.current
      ) {
        console.log("Saving content to database...");
        saveProjectInDatabase(projectId, lastContentRef.current)
          .then(() => {
            lastSavedContentRef.current = lastContentRef.current;
            console.log("Content saved successfully.");
          })
          .catch((error) => console.error("Error saving to database:", error));
      }
    }, 10000); // Save every 10 seconds

    return () => {
      // Clean up the subscription and interval when the component unmounts
      supabase.channel(`editor-broadcast${projectId}`).unsubscribe();
      clearInterval(interval);
    };
  }, [editor, projectId]);
  return <></>;
}
