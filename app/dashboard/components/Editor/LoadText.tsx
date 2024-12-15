"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { loadProjectFromDatabase } from "../../../actions";
import { createClient } from "@/utils/supabase/client";

interface LoadTextProps {
  projectId: string;
}

export default function LoadText({ projectId }: LoadTextProps) {
  const [editor] = useLexicalComposerContext();
  const hasLoaded = useRef(false); // Ref para comprobar si ya cargamos el contenido
  const supabase = createClient();

  useEffect(() => {
    const loadEditorState = async () => {
      try {
        const projectData = await loadProjectFromDatabase(projectId);
        console.log("Se obtiene content de database", projectData);

        // Verifica si `projectData` contiene datos válidos
        if (projectData && projectData.length > 0) {
          const { content } = projectData[0];

          // Verificar si el contenido es un objeto vacío o no está presente
          const isContentEmpty =
            !content ||
            (typeof content === "object" && Object.keys(content).length === 0);

          if (isContentEmpty) {
            // Si el contenido es vacío, crea un estado predeterminado
            const defaultState = editor.parseEditorState(
              JSON.stringify({
                root: {
                  children: [],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                  type: "root",
                  version: 1,
                },
              })
            );
            editor.setEditorState(defaultState);
          } else {
            // Si el contenido no está vacío, úsalo para inicializar el editor
            const newState = editor.parseEditorState(content);
            editor.setEditorState(newState);
          }

          editor.setEditable(true);
        }
      } catch (error) {
        console.error("Error al cargar el contenido del proyecto:", error);
      }
    };

    if (!hasLoaded.current) {
      loadEditorState();
      hasLoaded.current = true;
    }
    const subscription = supabase
      .channel("realtime:projects")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log("Cambio detectado en Realtime:", payload);
          const updatedContent = payload.new.content;
          const newState = editor.parseEditorState(updatedContent);
          editor.update(() => {
            editor.setEditorState(newState); // Solo actualizar el estado del editor
          });
        }
      )
      .subscribe();

    return () => {
      // Limpiar la suscripción cuando el componente se desmonte
      supabase.removeChannel(subscription);
    };
  }, [editor, projectId]);

  return <></>;
}
