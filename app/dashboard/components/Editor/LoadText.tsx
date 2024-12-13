"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { loadProjectFromDatabase } from "../../../actions";

interface LoadTextProps {
  projectId: string;
}

export default function LoadText({ projectId }: LoadTextProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Crear una función asíncrona para cargar el estado
    const loadEditorState = async () => {
      try {
        const projectData = await loadProjectFromDatabase(projectId);

        // Verifica si la respuesta tiene el contenido esperado
        if (projectData && projectData.length > 0) {
          const { content } = projectData[0];
          const newState = editor.parseEditorState(content);
          editor.setEditorState(newState);
          editor.setEditable(true);
        }
      } catch (error) {
        console.error("Error al cargar el contenido del proyecto:", error);
      }
    };

    loadEditorState();
  }, []);
  return <></>;
}
