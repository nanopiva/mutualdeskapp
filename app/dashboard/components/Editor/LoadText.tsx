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
  const isLocalUpdate = useRef(false); // Flag para cambios locales
  const lastContentRef = useRef<JSON | SerializedEditorState | null>(null); // Almacena el último contenido
  const lastSavedContentRef = useRef<JSON | SerializedEditorState | null>(null); //Almacena la última versión guardada

  const broadcastUpdate = (contentJSON: any) => {
    supabase.channel("editor-broadcast").send({
      type: "broadcast",
      event: "editor-content",
      payload: {
        content: contentJSON,
        clientId: userId,
      }, // Enviar el JSON
    });
    console.log("Broadcast enviado:", contentJSON);
  };

  const listenToBroadcast = () => {
    supabase
      .channel("editor-broadcast")
      .on("broadcast", { event: "editor-content" }, (payload) => {
        console.log("Broadcast recibido:", payload);

        // Ignorar cambios enviados por este cliente
        if (
          payload &&
          payload.payload &&
          payload.payload.content &&
          payload.payload.clientId !== userId
        ) {
          const { content } = payload.payload;

          // Marcar que el siguiente cambio no debe ser retransmitido
          isLocalUpdate.current = true;

          const newState = editor.parseEditorState(content);
          editor.setEditorState(newState);

          console.log("Estado actualizado desde broadcast.");
        }
      })
      .subscribe();
  };

  useEffect(() => {
    const loadEditorState = async () => {
      try {
        const projectData = await loadProjectFromDatabase(projectId);
        console.log("Se obtiene content de database", projectData);

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
        console.error("Error al cargar el contenido del proyecto:", error);
      }
    };
    loadEditorState();

    editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves }) => {
        if (isLocalUpdate.current) {
          // Si el cambio es remoto, resetea el flag y no lo retransmitas
          isLocalUpdate.current = false;
          return;
        }
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
          return;
        }
        const contentJSON = editorState.toJSON();
        lastContentRef.current = contentJSON; // Actualizar contenido actual
        console.log(
          "Estado local actualizado, enviando broadcast:",
          contentJSON
        );

        // Guardar en la base de datos y enviar broadcast
        broadcastUpdate(contentJSON);
      }
    );
    listenToBroadcast();
    // Auto-guardado cada 10 segundos
    const interval = setInterval(() => {
      if (
        lastContentRef.current && // Hay contenido nuevo
        lastContentRef.current !== lastSavedContentRef.current // Es diferente al último guardado
      ) {
        console.log("Guardando contenido en la base de datos...");
        saveProjectInDatabase(projectId, lastContentRef.current)
          .then(() => {
            lastSavedContentRef.current = lastContentRef.current; // Actualizar la última versión guardada
            console.log("Contenido guardado exitosamente.");
          })
          .catch((error) =>
            console.error("Error al guardar en la base de datos:", error)
          );
      }
    }, 10000); // Guardar cada 10 segundos

    return () => {
      // Limpiar la suscripción y el intervalo cuando el componente se desmonte
      supabase.channel("editor-broadcast").unsubscribe();
      clearInterval(interval);
    };
  }, [editor, projectId]);

  return <></>;
}
