"use client";
import Link from "next/link";
import styles from "./ProjectCardUser.module.css";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardUserProps {
  id: string;
  name: string;
  role: string;
  isGroup: boolean;
  isPublic: boolean;
  updatedAt: string;
  content?: any;
}

export default function ProjectCardUser({
  id,
  name,
  role,
  isGroup,
  isPublic,
  updatedAt,
  content,
}: ProjectCardUserProps) {
  const [hovered, setHovered] = useState(false);
  const [snippetImage, setSnippetImage] = useState("");

  const coerceContentToJSON = (raw: any): any | null => {
    if (!raw) return null;

    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        const el = document.createElement("div");
        el.innerHTML = raw;
        const plain = (el.textContent || el.innerText || "").trim();

        return plain
          ? {
              type: "doc",
              content: [
                { type: "paragraph", content: [{ type: "text", text: plain }] },
              ],
            }
          : null;
      }
    }

    return raw;
  };

  const extractTextFromContent = (raw: any): string => {
    const json = coerceContentToJSON(raw);
    if (!json) return "";

    let out = "";

    const walk = (node: any) => {
      if (!node) return;

      if (typeof node.text === "string") {
        out += node.text;
      }

      if (node.type === "hardBreak") {
        out += "\n";
      }

      if (Array.isArray(node.content)) {
        if (
          node.type === "paragraph" ||
          node.type === "heading" ||
          node.type === "listItem"
        ) {
          out += "\n";
        }
      }
    };

    walk(json);

    return out.replace(/\s+/g, " ").trim();
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number
  ) => {
    if (!text) return [];
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const generateSnippetImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = 300;
    canvas.height = 180;

    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = isPublic ? "#d4edda" : "#f8d7da";
    ctx.fillRect(0, 0, canvas.width, 30);

    ctx.fillStyle = "#212529";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    const title = name.length > 30 ? name.substring(0, 27) + "..." : name;
    ctx.fillText(title, 10, 20);

    ctx.fillStyle = "#495057";
    ctx.font = "12px Arial";
    const rawText = extractTextFromContent(content);
    const text =
      rawText && rawText.length > 0 ? rawText.slice(0, 600) : "No content yet";
    const lines = wrapText(ctx, text, canvas.width - 20, 14);

    let y = 50;
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      ctx.fillText(lines[i], 10, y);
      y += 16;
    }

    ctx.fillStyle = "#6c757d";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    ctx.fillText(
      `${role} • ${isPublic ? "Public" : "Private"}`,
      canvas.width - 10,
      canvas.height - 10
    );

    return canvas.toDataURL("image/png");
  };

  useEffect(() => {
    if (hovered) {
      setSnippetImage(generateSnippetImage());
    }
  }, [hovered, content, name, role, isPublic]);

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.projectName}>{name}</h3>
        <span
          className={`${styles.projectType} ${isGroup ? styles.group : styles.individual}`}
        >
          {isGroup ? "Group" : "Personal"}
        </span>
      </div>

      <div className={styles.metaInfo}>
        <span className={styles.role}>{role}</span>
        <span
          className={`${styles.visibility} ${isPublic ? styles.public : styles.private}`}
        >
          {isPublic ? "Public" : "Private"}
        </span>
      </div>

      <div className={styles.updatedAt}>
        Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
      </div>

      {hovered && snippetImage && (
        <div className={styles.preview}>
          <img src={snippetImage} alt="Project preview" />
          <div className={styles.previewArrow}></div>
        </div>
      )}

      <Link href={`/dashboard/my-projects/${id}`} className={styles.openButton}>
        Open Project
      </Link>
    </div>
  );
}
