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

  const generateSnippetImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = 300;
    canvas.height = 180;

    // Background with subtle pattern
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add header bar
    ctx.fillStyle = isPublic ? "#d4edda" : "#f8d7da";
    ctx.fillRect(0, 0, canvas.width, 30);

    // Add title
    ctx.fillStyle = "#212529";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    const title = name.length > 30 ? name.substring(0, 27) + "..." : name;
    ctx.fillText(title, 10, 20);

    // Add content
    ctx.fillStyle = "#495057";
    ctx.font = "12px Arial";
    const text = extractTextFromContent(content) || "No content yet";
    const lines = wrapText(ctx, text, canvas.width - 20, 14);

    let y = 50;
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      ctx.fillText(lines[i], 10, y);
      y += 16;
    }

    // Add footer with role and privacy
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

  const extractTextFromContent = (content: any): string => {
    if (!content || !content.content || !Array.isArray(content.content)) {
      return "";
    }

    let text = "";

    content.content.forEach((block: any) => {
      if (block.content && Array.isArray(block.content)) {
        block.content.forEach((textNode: any) => {
          if (textNode.text && typeof textNode.text === "string") {
            text += textNode.text;
            if (textNode.text[textNode.text.length - 1] !== " ") {
              text += " ";
            }
          }
        });
      }
    });

    return text.trim();
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  useEffect(() => {
    if (hovered) {
      setSnippetImage(generateSnippetImage());
    }
  }, [hovered]);

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
