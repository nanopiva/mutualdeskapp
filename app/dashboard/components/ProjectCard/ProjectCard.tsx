import styles from "./ProjectCard.module.css";
import Link from "next/link";

interface ProjectCardProps {
  address: string;
  name?: string;
}

export default function ProjectCard({ address, name }: ProjectCardProps) {
  return (
    <Link href={`/dashboard/${address}`}>
      <div className={styles.card}>
        <div className={styles.icon}>+</div>
        {name ? <p>{name}</p> : <p>Crear nuevo proyecto</p>}
      </div>
    </Link>
  );
}
