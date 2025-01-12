"use client";
import Link from "next/link";
import styles from "./ProjectCard.module.css";
import groupIcon from "../Sidebar/group-svgrepo-com.svg";
import individualIcon from "./user-svgrepo-com.svg";
import Image from "next/image";
import { useState } from "react";

interface ProjectCardProps {
  id: string;
  name: string | undefined;
  role: string;
  isGroup: boolean;
  isPublic: boolean | undefined;
  contentSnippet: string;
}

export default function ProjectCard({
  id,
  name = "Untitled Project",
  role,
  isGroup,
  isPublic,
  contentSnippet,
}: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  const generateSnippetImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("No se pudo obtener el contexto del Canvas.");
      return "";
    }

    canvas.width = 300;
    canvas.height = 150;

    ctx.fillStyle = "#bbb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const lineHeight = 20;
    const padding = 10;
    const maxWidth = canvas.width - padding * 2;
    const words = contentSnippet.split(" ");
    let line = "";
    let y = padding;

    for (const word of words) {
      const testLine = line + word + " ";
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && line) {
        ctx.fillText(line, padding, y);
        line = word + " ";
        y += lineHeight;
        if (y + lineHeight > canvas.height) break;
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.fillText(line, padding, y);
    }

    return canvas.toDataURL("image/png");
  };

  const snippetImage = generateSnippetImage();

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.header}>
        <h3>{name}</h3>
        <Image
          src={isGroup ? groupIcon : individualIcon}
          alt={isGroup ? "Group Project" : "Individual Project"}
          width={24}
          height={24}
        />
      </div>
      <p className={styles.role}>Role: {role}</p>
      <p className={styles.access}>
        {isPublic ? "Public Project" : "Private Project"}
      </p>
      {hovered && snippetImage && (
        <div className={styles.preview}>
          <img src={snippetImage} alt="Snippet Preview" />
        </div>
      )}
      <Link legacyBehavior href={`/dashboard/my-projects/${id}`}>
        <a className={styles.link}>Open project</a>
      </Link>
    </div>
  );
}
