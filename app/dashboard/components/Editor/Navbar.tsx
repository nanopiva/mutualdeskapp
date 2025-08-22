"use client";

import { useState } from "react";
import { DocumentInput } from "./DocumentInput";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarShortcut,
} from "@/components/ui/menubar";
import {
  BoldIcon,
  FileIcon,
  FileJsonIcon,
  FilePenIcon,
  FilePlusIcon,
  FileTextIcon,
  GlobeIcon,
  ItalicIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  TextIcon,
  TrashIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import { BsFilePdf } from "react-icons/bs";

import { useEditorStore } from "./use-editor-store";
import { Avatars } from "../../my-projects/[projectId]/avatars";
import { Inbox } from "../../my-projects/[projectId]/inbox";

import { createClient } from "@/utils/supabase/client";

export const Navbar = ({
  projectTitle: initialTitle,
  isAuthor,
  projectId,
}: {
  projectTitle: string;
  isAuthor: boolean;
  projectId: string;
}) => {
  const { editor } = useEditorStore();
  const supabase = createClient();

  const [title, setTitle] = useState(initialTitle);

  const insertTable = ({ rows, cols }: { rows: number; cols: number }) => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: false })
      .run();
  };

  const onDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const onSaveJSON = () => {
    if (!editor) return;
    const content = editor.getJSON();
    const blob = new Blob([JSON.stringify(content)], {
      type: "application/json",
    });
    onDownload(blob, `${title}.json`);
  };

  const onExportPDF = async () => {
    try {
      const el =
        (document.querySelector(".editor-surface") as HTMLElement | null) ||
        (document.querySelector(".tiptap") as HTMLElement | null);

      if (!el) {
        alert("Document content not found.");
        return;
      }

      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: [10, 12, 10, 12],
        filename: `${title || "Document"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
        },
      } as const;

      await html2pdf().set(opt).from(el).save();
    } catch (e) {
      console.error(e);
      alert("We could not export the PDF.");
    }
  };

  const onSaveHTML = () => {
    if (!editor) return;
    const content = editor.getHTML();
    const blob = new Blob([content], { type: "text/html" });
    onDownload(blob, `${title}.html`);
  };

  const onSaveText = () => {
    if (!editor) return;
    const content = editor.getText();
    const blob = new Blob([content], { type: "text/plain" });
    onDownload(blob, `${title}.txt`);
  };

  const handleRename = async () => {
    const newName = prompt("Enter new project name:", title);
    if (!newName || newName === title) return;

    const { error } = await supabase
      .from("projects")
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq("id", projectId);

    if (error) {
      console.error("Error renaming project:", error.message);
      alert("Could not rename project");
      return;
    }

    setTitle(newName);
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const { error: membersError } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId);

    if (membersError) {
      console.error("Error deleting members:", membersError.message);
      alert("Could not delete project members");
      return;
    }

    const { error: projectError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (projectError) {
      console.error("Error deleting project:", projectError.message);
      alert("Could not delete project");
      return;
    }
  };

  const triggerBase =
    "text-[var(--black)] text-sm font-normal py-0.5 px-[7px] rounded-sm h-auto " +
    "hover:bg-[var(--gray)]/10 data-[state=open]:bg-[var(--gray)]/20 " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--light-green)]";

  const itemBase =
    "flex items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none " +
    "hover:bg-[var(--gray)]/10 hover:text-[var(--light-green)] " +
    "focus:bg-[var(--gray)]/10 focus:text-[var(--light-green)] " +
    "data-[state=open]:bg-[var(--gray)]/10 data-[state=open]:text-[var(--light-green)]";

  const contentBase =
    "print:hidden border border-[var(--input-border)] bg-[var(--white)] text-[var(--black)] " +
    "[&_[data-radix-menubar-item]]:text-[var(--black)]";

  const triggerFix =
    "data-[state=open]:!bg-transparent data-[state=open]:!text-[var(--black)]";

  const subTriggerFix =
    "!text-[var(--black)] data-[state=open]:!bg-[var(--gray)]/10 data-[state=open]:!text-[var(--black)]";

  return (
    <nav className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <div className="flex flex-col">
          <DocumentInput title={title} />
          <div className="flex">
            <Menubar className="border-none bg-transparent shadow-none h-auto p-0">
              <MenubarMenu>
                <MenubarTrigger className={`${triggerBase} ${triggerFix}`}>
                  File
                </MenubarTrigger>
                <MenubarContent className={contentBase}>
                  <MenubarSub>
                    <MenubarSubTrigger
                      className={`${itemBase} ${subTriggerFix}`}
                    >
                      <FileIcon className="size-4 mr-2" />
                      Save
                    </MenubarSubTrigger>
                    <MenubarSubContent className={contentBase}>
                      <MenubarItem className={itemBase} onClick={onSaveJSON}>
                        <FileJsonIcon className="size-4 mr-2" />
                        JSON
                      </MenubarItem>
                      <MenubarItem className={itemBase} onClick={onSaveHTML}>
                        <GlobeIcon className="size-4 mr-2" />
                        HTML
                      </MenubarItem>
                      <MenubarItem className={itemBase} onClick={onExportPDF}>
                        <BsFilePdf className="size-4 mr-2" />
                        PDF
                      </MenubarItem>
                      <MenubarItem className={itemBase} onClick={onSaveText}>
                        <FileTextIcon className="size-4 mr-2" />
                        Text
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  <MenubarItem className={itemBase}>
                    <FilePlusIcon className="size-4 mr-2" />
                    New Document
                  </MenubarItem>

                  <MenubarSeparator className="bg-[var(--gray)]/20 mx-2" />

                  <MenubarItem
                    className={`${itemBase} ${!isAuthor ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={isAuthor ? handleRename : undefined}
                    disabled={!isAuthor}
                    aria-disabled={!isAuthor}
                  >
                    <FilePenIcon className="size-4 mr-2" />
                    Rename
                  </MenubarItem>

                  <MenubarItem
                    className={`${itemBase} ${!isAuthor ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={isAuthor ? handleRemove : undefined}
                    disabled={!isAuthor}
                    aria-disabled={!isAuthor}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Remove
                  </MenubarItem>

                  <MenubarSeparator className="bg-[var(--gray)]/20 mx-2" />

                  <MenubarItem
                    className={itemBase}
                    onClick={() => window.print()}
                  >
                    <PrinterIcon className="size-4 mr-2" />
                    Print
                    <MenubarShortcut className="text-[var(--black)] ml-4">
                      ⌘P
                    </MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className={`${triggerBase} ${triggerFix}`}>
                  Edit
                </MenubarTrigger>
                <MenubarContent className={contentBase}>
                  <MenubarItem
                    className={itemBase}
                    onClick={() => editor?.chain().focus().undo().run()}
                  >
                    <Undo2Icon className="size-4 mr-2" />
                    Undo
                    <MenubarShortcut className="text-[var(--black)] ml-4">
                      ⌘Z
                    </MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    className={itemBase}
                    onClick={() => editor?.chain().focus().redo().run()}
                  >
                    <Redo2Icon className="size-4 mr-2" />
                    Redo
                    <MenubarShortcut className="text-[var(--black)] ml-4">
                      ⇧⌘Z
                    </MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className={`${triggerBase} ${triggerFix}`}>
                  Insert
                </MenubarTrigger>
                <MenubarContent className={contentBase}>
                  <MenubarSub>
                    <MenubarSubTrigger
                      className={`${itemBase} ${subTriggerFix}`}
                    >
                      Table
                    </MenubarSubTrigger>
                    <MenubarSubContent className={contentBase}>
                      <MenubarItem
                        className={itemBase}
                        onClick={() => insertTable({ rows: 1, cols: 1 })}
                      >
                        1x1
                      </MenubarItem>
                      <MenubarItem
                        className={itemBase}
                        onClick={() => insertTable({ rows: 2, cols: 2 })}
                      >
                        2x2
                      </MenubarItem>
                      <MenubarItem
                        className={itemBase}
                        onClick={() => insertTable({ rows: 3, cols: 3 })}
                      >
                        3x3
                      </MenubarItem>
                      <MenubarItem
                        className={itemBase}
                        onClick={() => insertTable({ rows: 4, cols: 4 })}
                      >
                        4x4
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className={`${triggerBase} ${triggerFix}`}>
                  Format
                </MenubarTrigger>
                <MenubarContent className={contentBase}>
                  <MenubarSub>
                    <MenubarSubTrigger
                      className={`${itemBase} ${subTriggerFix}`}
                    >
                      <TextIcon className="size-4 mr-2" />
                      Text
                    </MenubarSubTrigger>
                    <MenubarSubContent className={contentBase}>
                      <MenubarItem
                        className={itemBase}
                        onClick={() =>
                          editor?.chain().focus().toggleBold().run()
                        }
                      >
                        <BoldIcon className="size-4 mr-2" />
                        Bold
                        <MenubarShortcut className="text-[var(--black)] ml-4">
                          ⌘B
                        </MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem
                        className={itemBase}
                        onClick={() =>
                          editor?.chain().focus().toggleItalic().run()
                        }
                      >
                        <ItalicIcon className="size-4 mr-2" />
                        Italic
                        <MenubarShortcut className="text-[var(--black)] ml-4">
                          ⌘I
                        </MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem
                        className={itemBase}
                        onClick={() =>
                          editor?.chain().focus().toggleUnderline().run()
                        }
                      >
                        <UnderlineIcon className="size-4 mr-2" />
                        Underline
                        <MenubarShortcut className="text-[var(--black)] ml-4">
                          ⌘U
                        </MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem
                        className={itemBase}
                        onClick={() =>
                          editor?.chain().focus().toggleStrike().run()
                        }
                      >
                        <StrikethroughIcon className="size-4 mr-2" />
                        Strikethrough
                        <MenubarShortcut className="text-[var(--black)] ml-4">
                          ⌘S
                        </MenubarShortcut>
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>

                  <MenubarItem
                    className={itemBase}
                    onClick={() =>
                      editor?.chain().focus().unsetAllMarks().run()
                    }
                  >
                    <RemoveFormattingIcon className="size-4 mr-2" />
                    Clear formatting
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
      </div>

      <div className="flex gap-3 items-center pl-6">
        <Avatars />
        <Inbox />
      </div>
    </nav>
  );
};
