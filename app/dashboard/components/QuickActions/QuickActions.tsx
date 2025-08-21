"use client";
import Link from "next/link";
import { Plus, Users, Mail, UserPlus } from "lucide-react";
import styles from "./QuickActions.module.css";

const actions = [
  {
    title: "New Project",
    description: "Start a new writing project",
    icon: <Plus size={32} />,
    href: "/dashboard/my-projects/new-project",
    color: "var(--strong-green)",
    bgColor: "rgba(36, 130, 50, 0.1)",
  },
  {
    title: "Create Group",
    description: "Collaborate with others",
    icon: <Users size={32} />,
    href: "/dashboard/groups/create-group",
    color: "var(--light-green)",
    bgColor: "rgba(43, 168, 74, 0.1)",
  },
  {
    title: "Invitations",
    description: "View pending requests",
    icon: <Mail size={32} />,
    href: "/dashboard/invitations",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.1)",
  },
  {
    title: "Add Friends",
    description: "Connect with others",
    icon: <UserPlus size={32} />,
    href: "/dashboard/friends",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
];

export default function QuickActions() {
  return (
    <section className={styles.quickActions}>
      <h2 className={styles.title}>Quick Actions</h2>
      <div className={styles.actionsGrid}>
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={styles.actionCard}
            style={
              {
                "--icon-color": action.color,
                "--bg-color": action.bgColor,
              } as React.CSSProperties
            }
          >
            <div className={styles.iconContainer}>{action.icon}</div>
            <div className={styles.textContainer}>
              <h3 className={styles.actionTitle}>{action.title}</h3>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
