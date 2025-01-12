"use client";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  $isTextNode,
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  Klass,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  TextNode,
} from "lexical";

import ExampleTheme from "./ExampleTheme";
import Toolbar from "./Toolbar";
import "./editorStyles.css";
import MenuBar from "./MenuBar";
import { useState } from "react";

import { parseAllowedColor, parseAllowedFontSize } from "./styleConfig";
import LoadText from "./LoadText";
import UsersInProject from "../UsersInProject/UsersInProject";
const removeStylesExportDOM = (
  editor: LexicalEditor,
  target: LexicalNode
): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && output.element instanceof HTMLElement) {
    // Remove all inline styles and classes if the element is an HTMLElement
    // Children are checked as well since TextNode can be nested
    // in i, b, and strong tags.
    for (const el of [
      output.element,
      ...output.element.querySelectorAll('[style],[class],[dir="ltr"]'),
    ]) {
      el.removeAttribute("class");
      el.removeAttribute("style");
      if (el.getAttribute("dir") === "ltr") {
        el.removeAttribute("dir");
      }
    }
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = "";
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== "" && fontSize !== "15px") {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== "" && backgroundColor !== "rgb(255, 255, 255)") {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== "" && color !== "rgb(0, 0, 0)") {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
};

const editorConfig = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: "React.js Demo",
  nodes: [ParagraphNode, TextNode],
  onError(error: Error) {
    throw error;
  },
  theme: ExampleTheme,
  editable: false,
};

interface EditorProps {
  projectId: string;
  userId: string | null | undefined;
}

export default function Editor({ projectId, userId }: EditorProps) {
  type PageSizeKey = "A4" | "A3" | "Letter" | "Legal";

  const pageSizes: Record<PageSizeKey, { width: string; height: string }> = {
    A4: { width: "210mm", height: "297mm" },
    A3: { width: "297mm", height: "420mm" },
    Letter: { width: "8.5in", height: "11in" },
    Legal: { width: "8.5in", height: "14in" },
  };
  const [selectedPageSize, setSelectedPageSize] = useState<PageSizeKey>("A4");

  const pageStyle = {
    ...pageSizes[selectedPageSize],
    margin: "10mm auto", // Margen entre páginas
    background: "#fff",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
    padding: "20mm", // Margen interno
    overflow: "hidden",
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <LoadText projectId={projectId} userId={userId} />
        <UsersInProject projectId={projectId} currentUserId={userId} />
        <MenuBar projectId={projectId} />
        <Toolbar projectId={projectId} onPageSizeChange={setSelectedPageSize} />
        <div className="editor-pages">
          <div className="editor-page" style={pageStyle}>
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
          </div>
        </div>
      </div>
    </LexicalComposer>
  );
}
