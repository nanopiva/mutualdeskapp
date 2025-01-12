"use client";
import React, { useState, useRef } from "react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Link from "next/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { saveProjectInDatabase } from "@/app/actions";
import { printEditorContent } from "@/utils/printUtils";

interface MenuBarProps {
  projectId: string;
}

export default function MenuBar({ projectId }: MenuBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openLoading, setOpenLoading] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [editor] = useLexicalComposerContext();

  const handleOpenProject = async (file: File | undefined) => {
    if (!file) {
      alert("No file selected.");
      return;
    }

    if (!projectId) {
      alert("No project selected. Please select a project first.");
      return;
    }

    setOpenLoading(true);

    try {
      const content = await file.text();

      const newState = editor.parseEditorState(content);
      editor.setEditorState(newState);

      alert("Project updated successfully!");
    } catch (error) {
      console.error("Failed to open the project:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
      );
    } finally {
      setOpenLoading(false);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    handleOpenProject(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProject = async () => {
    setSavingProject(true);
    try {
      const actualContent = await editor.getEditorState().toJSON();
      await saveProjectInDatabase(projectId, actualContent);
      alert("Project saved successfully");
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setSavingProject(false);
    }
  };

  const handlePrint = () => {
    const editorState = editor.getEditorState();
    printEditorContent(editorState);
  };

  return (
    <Menubar className="bg-[var(--gray)] text-white shadow-md rounded ">
      <MenubarMenu>
        <MenubarTrigger className="text-lg font-medium hover:text-light-green cursor-pointer">
          File
        </MenubarTrigger>
        <MenubarContent className="bg-[var(--gray)] text-white ">
          <Link href="/dashboard/my-projects/new-project">
            <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
              New project
            </MenubarItem>
          </Link>
          <MenubarItem
            className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer"
            onClick={triggerFileInput}
            disabled={openLoading}
          >
            {openLoading ? "Opening..." : "Open project"}
          </MenubarItem>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".txt,.json,.md,.csv"
            onChange={handleFileInputChange}
          />
          <MenubarItem
            className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer"
            onClick={handleSaveProject}
            disabled={savingProject}
          >
            {savingProject ? "Saving..." : "Save project"}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger className="hover:text-light-green hover:cursor-pointer">
              Share
            </MenubarSubTrigger>
            <MenubarSubContent className="bg-[var(--gray)] text-white">
              <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
                Email link
              </MenubarItem>
              <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
                Messages
              </MenubarItem>
              <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
                Notes
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem
            className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer"
            onClick={handlePrint}
          >
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="text-lg font-medium hover:text-light-green cursor-pointer">
          Edit
        </MenubarTrigger>
        <MenubarContent className="bg-[var(--gray)] text-white">
          <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger className="hover:text-light-green hover:cursor-pointer">
              Find
            </MenubarSubTrigger>
            <MenubarSubContent className="bg-[var(--gray)] text-white">
              <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
                Search the web
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
                Find...
              </MenubarItem>
              <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
                Find Next
              </MenubarItem>
              <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
                Find Previous
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
            Cut
          </MenubarItem>
          <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
            Copy
          </MenubarItem>
          <MenubarItem className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer">
            Paste
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="text-lg font-medium hover:text-light-green cursor-pointer">
          View
        </MenubarTrigger>
        <MenubarContent className="bg-[var(--gray)] text-white">
          <MenubarCheckboxItem className="hover:text-light-green hover:cursor-pointer">
            Always Show Bookmarks Bar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked
            className="hover:text-light-green hover:cursor-pointer"
          >
            Always Show Full URLs
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem
            inset
            className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer"
          >
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled inset className="opacity-50">
            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            inset
            className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer"
          >
            Toggle Fullscreen
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            inset
            className="hover:bg-gray-600 hover:text-light-green hover:cursor-pointer"
          >
            Hide Toolbar
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
