import { EditorState, LineBreakNode } from "lexical";

export function printEditorContent(editorState: EditorState) {
  const content = editorState.read(() => {
    return JSON.stringify(editorState.toJSON());
  });

  // Create a new window for printing
  const printWindow = window.open("");
  if (!printWindow) {
    console.error("Failed to open print window");
    return;
  }

  // Write the content to the new window
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Project</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        ${content
          .split("\n")
          .map((line: any) => `<p>${line}</p>`)
          .join("")}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Trigger the print dialog
  printWindow.print();
}
