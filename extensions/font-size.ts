import { Extension, CommandProps } from "@tiptap/core";
import "@tiptap/extension-text-style";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;

      unsetFontSize: () => ReturnType;
    };
  }
}

function normalizeSize(size: string): string {
  const trimmed = String(size).trim().replace(/["']/g, "");

  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
}

export const FontSizeExtension = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const value = (element as HTMLElement).style?.fontSize || null;
              return value ? value.replace(/["']/g, "") : null;
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: CommandProps) => {
          const value = normalizeSize(fontSize);
          return chain().setMark("textStyle", { fontSize: value }).run();
        },

      unsetFontSize:
        () =>
        ({ chain }: CommandProps) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
