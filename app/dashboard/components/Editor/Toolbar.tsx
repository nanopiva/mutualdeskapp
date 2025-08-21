"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  ListCollapseIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  type LucideIcon,
  MessageSquarePlusIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SpellCheckIcon,
  UnderlineIcon,
  Undo2Icon,
  UploadIcon,
} from "lucide-react";

import { type ColorResult, SketchPicker } from "react-color";
import type { Level } from "@tiptap/extension-heading";
import { useEditorStore } from "./use-editor-store";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function useEditorRerender(editor: any) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const update = () => setTick((t) => t + 1);
    editor.on?.("selectionUpdate", update);
    editor.on?.("transaction", update);
    editor.on?.("update", update);
    editor.on?.("focus", update);
    editor.on?.("blur", update);
    return () => {
      editor.off?.("selectionUpdate", update);
      editor.off?.("transaction", update);
      editor.off?.("update", update);
      editor.off?.("focus", update);
      editor.off?.("blur", update);
    };
  }, [editor]);
}

const menuContentBase =
  "p-1 flex flex-col gap-y-1 border bg-[var(--white)] text-[var(--black)] border-[var(--input-border)]";

const triggerBtnBase =
  "h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm px-1.5 overflow-hidden text-sm text-[var(--black)] " +
  "hover:bg-[var(--gray)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--light-green)] " +
  "data-[state=open]:bg-[var(--gray)]/20";

const menuItemBtnBase =
  "flex items-center gap-x-2 px-2 py-1 rounded-sm text-[var(--black)] " +
  "hover:bg-[var(--gray)]/10 focus:bg-[var(--gray)]/10";

const LineHeightButton = () => {
  const { editor } = useEditorStore();
  const lineHeights = [
    { label: "Default", value: "normal" },
    { label: "Single", value: "1" },
    { label: "1.15", value: "1.15" },
    { label: "1.5", value: "1.5" },
    { label: "Double", value: "2" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={triggerBtnBase} aria-label="Line height">
          <ListCollapseIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={menuContentBase}>
        {lineHeights.map(({ label, value }) => {
          const active =
            editor?.getAttributes("paragraph").lineHeight === value;
          return (
            <button
              key={value}
              onClick={() => editor?.chain().focus().setLineHeight(value).run()}
              className={`${menuItemBtnBase} ${active ? "bg-[var(--gray)]/20" : ""}`}
            >
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontSizeButton = () => {
  const { editor } = useEditorStore();
  useEditorRerender(editor);

  const currentFontSizeFromEditor = () => {
    const fs = editor?.getAttributes("textStyle")?.fontSize;
    return fs ? fs.replace("px", "") : "16";
  };

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentFontSizeFromEditor());

  useEffect(() => {
    setInputValue(currentFontSizeFromEditor());
  }, [editor]);

  const updateFontSize = (newSize: string) => {
    const size = Number.parseInt(newSize);
    if (!isNaN(size) && size > 0) {
      editor?.chain().focus().setFontSize(`${size}px`).run();
      setInputValue(newSize);
      setIsEditing(false);
    }
  };

  const inc = () =>
    updateFontSize(String(Number.parseInt(inputValue || "16") + 1));
  const dec = () =>
    updateFontSize(
      String(Math.max(1, Number.parseInt(inputValue || "16") - 1))
    );

  const iconBtn =
    "h-7 w-7 shrink-0 flex items-center justify-center rounded-sm text-[var(--black)] " +
    "hover:bg-[var(--gray)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--light-green)]";

  return (
    <div className="flex items-center gap-x-0.5">
      <button className={iconBtn} onClick={dec} aria-label="Decrease font size">
        <MinusIcon className="size-4" />
      </button>

      {isEditing ? (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => updateFontSize(inputValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              updateFontSize(inputValue);
              editor?.commands.focus();
            }
          }}
          className="h-7 w-12 text-sm text-center rounded-sm bg-transparent text-[var(--black)] border border-[var(--input-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--light-green)]"
        />
      ) : (
        <button
          className="h-7 w-12 text-sm text-center rounded-sm text-[var(--black)] hover:bg-[var(--gray)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--light-green)]"
          onClick={() => {
            setIsEditing(true);
            setInputValue(currentFontSizeFromEditor());
          }}
          aria-label="Current font size"
        >
          {currentFontSizeFromEditor()}
        </button>
      )}

      <button className={iconBtn} onClick={inc} aria-label="Increase font size">
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
};

const ListButton = () => {
  const { editor } = useEditorStore();
  useEditorRerender(editor);

  const lists = [
    {
      label: "Bullet List",
      icon: ListIcon,
      isActive: () => editor?.isActive("bulletList"),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      icon: ListOrderedIcon,
      isActive: () => editor?.isActive("orderedList"),
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={triggerBtnBase} aria-label="Lists">
          <ListIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={menuContentBase}>
        {lists.map(({ label, icon: Icon, onClick, isActive }) => (
          <button
            key={label}
            onClick={onClick}
            className={`${menuItemBtnBase} ${isActive() ? "bg-[var(--gray)]/20" : ""}`}
          >
            <Icon className="size-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AlignButton = () => {
  const { editor } = useEditorStore();
  useEditorRerender(editor);

  const alignments = [
    { label: "Align left", value: "left", icon: AlignLeftIcon },
    { label: "Align center", value: "center", icon: AlignCenterIcon },
    { label: "Align right", value: "right", icon: AlignRightIcon },
    { label: "Align justify", value: "justify", icon: AlignJustifyIcon },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={triggerBtnBase} aria-label="Text alignment">
          <AlignLeftIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={menuContentBase}>
        {alignments.map(({ label, value, icon: Icon }) => {
          const active = editor?.isActive({ textAlign: value });
          return (
            <button
              key={value}
              onClick={() => editor?.chain().focus().setTextAlign(value).run()}
              className={`${menuItemBtnBase} ${active ? "bg-[var(--gray)]/20" : ""}`}
            >
              <Icon className="size-4" />
              <span className="text-sm">{label}</span>
            </button>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ImageButton = () => {
  const { editor } = useEditorStore();

  const onUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      try {
        editor?.chain().focus().setImage({ src: objectUrl }).run();
      } catch (err) {
        console.error("Error inserting image:", err);
        URL.revokeObjectURL(objectUrl);
      }
    };
    input.click();
  }, [editor]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={triggerBtnBase} aria-label="Insert image">
          <ImageIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border border-[var(--input-border)] bg-[var(--white)] text-[var(--black)]">
        <DropdownMenuItem
          className="flex items-center focus:bg-[var(--gray)]/10"
          onClick={onUpload}
        >
          <UploadIcon className="size-4 mr-2" />
          Upload
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LinkButton = () => {
  const { editor } = useEditorStore();
  useEditorRerender(editor);

  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(editor?.getAttributes("link")?.href || "");
  }, [editor]);

  useEffect(() => {
    if (!editor?.view?.dom) return;
    const dom = editor.view.dom;
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target && (target as HTMLAnchorElement).href) {
        const href = (target as HTMLAnchorElement).getAttribute("href");
        if (href) window.open(href, "_blank", "noopener");
      }
    };
    dom.addEventListener("click", handler);
    return () => dom.removeEventListener("click", handler);
  }, [editor]);

  const onApply = (href: string) => {
    editor?.chain().focus().setLink({ href }).run();
    setValue("");
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          setValue(editor?.getAttributes("link")?.href || "");
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button className={triggerBtnBase} aria-label="Insert link">
          <Link2Icon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2.5 flex items-center gap-x-2 border border-[var(--input-border)] bg-[var(--white)] text-[var(--black)]">
        <Input
          placeholder="https://example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-[var(--black)] focus-visible:ring-[var(--light-green)]"
        />
        <Button
          onClick={() => onApply(value)}
          className="text-[var(--white)]"
          style={{ background: "var(--button-bg)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--button-bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--button-bg)")
          }
        >
          Apply
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HighlightColorButton = () => {
  const { editor } = useEditorStore();
  useEditorRerender(editor);
  const value = editor?.getAttributes("highlight")?.color || "#FFFFFF";

  const onChange = (color: ColorResult) => {
    editor?.chain().focus().setHighlight({ color: color.hex }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={triggerBtnBase} aria-label="Highlight color">
          <HighlighterIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 border border-[var(--input-border)] bg-[var(--white)] text-[var(--black)]">
        <SketchPicker color={value} onChange={onChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TextColorButton = () => {
  const { editor } = useEditorStore();
  useEditorRerender(editor);
  const value = editor?.getAttributes("textStyle")?.color || "#000000";

  const onChange = (color: ColorResult) => {
    editor?.chain().focus().setColor(color.hex).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${triggerBtnBase} flex-col`}
          aria-label="Text color"
        >
          <span className="text-xs">A</span>
          <div className="h-0.5 w-full" style={{ backgroundColor: value }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 border border-[var(--input-border)] bg-[var(--white)] text-[var(--black)]">
        <SketchPicker color={value} onChange={onChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HeadingLevelButton = () => {
  const { editor } = useEditorStore();
  useEditorRerender(editor);

  const headings = [
    { label: "Normal text", value: 0, fontSize: "16px" },
    { label: "Heading 1", value: 1, fontSize: "32px" },
    { label: "Heading 2", value: 2, fontSize: "24px" },
    { label: "Heading 3", value: 3, fontSize: "20px" },
    { label: "Heading 4", value: 4, fontSize: "18px" },
  ];
  const getCurrentHeading = () => {
    for (let i = 1; i <= 5; i++) {
      if (editor?.isActive("heading", { level: i })) {
        return `Heading ${i}`;
      }
    }
    return "Normal text";
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${triggerBtnBase} w-auto min-w-7 justify-between`}
          aria-label="Heading level"
        >
          <span className="truncate">{getCurrentHeading()}</span>
          <ChevronDownIcon className="ml-2 size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={menuContentBase}>
        {headings.map(({ label, value, fontSize }) => (
          <button
            key={value}
            style={{ fontSize }}
            onClick={() => {
              if (value === 0) {
                editor?.chain().focus().setParagraph().run();
              } else {
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: value as Level })
                  .run();
              }
            }}
            className={menuItemBtnBase}
          >
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontFamilyButton = () => {
  const { editor } = useEditorStore();
  useEditorRerender(editor);

  const fontFamilies = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Courier New", value: "'Courier New', monospace" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${triggerBtnBase} w-[140px] justify-between`}
          aria-label="Font family"
        >
          <span className="truncate">
            {editor?.getAttributes("textStyle")?.fontFamily || "Arial"}
          </span>
          <ChevronDownIcon className="ml-2 size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={menuContentBase}>
        {fontFamilies.map(({ label, value }) => (
          <button
            onClick={() => editor?.chain().focus().setFontFamily(value).run()}
            key={value}
            className={menuItemBtnBase}
            style={{ fontFamily: value }}
          >
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  icon: LucideIcon;
}
const ToolbarButton = ({
  onClick,
  isActive,
  icon: Icon,
}: ToolbarButtonProps) => (
  <button
    aria-pressed={!!isActive}
    onClick={onClick}
    className={`text-sm h-7 min-w-7 flex items-center justify-center rounded-sm text-[var(--black)]
                hover:bg-[var(--gray)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--light-green)]
                ${isActive ? "bg-[var(--gray)]/20" : ""}`}
  >
    <Icon className="size-4" />
  </button>
);

export function Toolbar() {
  const { editor } = useEditorStore();
  useEditorRerender(editor);

  const sections: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
  }[][] = [
    [
      {
        label: "Undo",
        icon: Undo2Icon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: Redo2Icon,
        onClick: () => editor?.chain().focus().redo().run(),
      },
      { label: "Print", icon: PrinterIcon, onClick: () => window.print() },
      {
        label: "Spell Check",
        icon: SpellCheckIcon,
        onClick: () => {
          const current = editor?.view.dom.getAttribute("spellcheck");
          editor?.view.dom.setAttribute(
            "spellcheck",
            current === "false" ? "true" : "false"
          );
        },
      },
    ],
    [
      {
        label: "Bold",
        icon: BoldIcon,
        onClick: () => editor?.chain().focus().toggleBold().run(),
        isActive: editor?.isActive("bold"),
      },
      {
        label: "Italic",
        icon: ItalicIcon,
        onClick: () => editor?.chain().focus().toggleItalic().run(),
        isActive: editor?.isActive("italic"),
      },
      {
        label: "Underline",
        icon: UnderlineIcon,
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
        isActive: editor?.isActive("underline"),
      },
    ],
    [
      {
        label: "Comment",
        icon: MessageSquarePlusIcon,
        onClick: () => editor?.chain().focus().addPendingComment().run(),
        isActive: editor?.isActive("liveblocksCommentMark"),
      },
      {
        label: "List Todo",
        icon: ListTodoIcon,
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
        isActive: editor?.isActive("taskList"),
      },
      {
        label: "Remove Formatting",
        icon: RemoveFormattingIcon,
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
      },
    ],
  ];

  const divider = "h-6 bg-[var(--input-border)]";

  return (
    <div
      className="px-2.5 py-0.5 rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto border"
      style={{
        background: "var(--background)",
        borderColor: "var(--input-border)",
      }}
    >
      {sections[0].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}

      <Separator orientation="vertical" className={divider} />

      <FontFamilyButton />

      <Separator orientation="vertical" className={divider} />

      <HeadingLevelButton />

      <Separator orientation="vertical" className={divider} />

      <FontSizeButton />

      <Separator orientation="vertical" className={divider} />

      {sections[1].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}

      <TextColorButton />
      <HighlightColorButton />

      <Separator orientation="vertical" className={divider} />

      <LinkButton />
      <ImageButton />
      <AlignButton />
      <LineHeightButton />
      <ListButton />

      {sections[2].map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
    </div>
  );
}
