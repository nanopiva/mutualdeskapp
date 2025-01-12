import styles from "./MemberCard.module.css";
import AvatarIcon from "../AvatarIcon/AvatarIcon";

interface MemberCardProps {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture: string;
  created_at: Date;
}

export default function MemberCard({
  firstName,
  lastName,
  email,
  role,
  profilePicture,
  created_at,
}: MemberCardProps) {
  const formattedDate = new Date(created_at).toLocaleDateString();

  return (
    <div className={styles.card}>
      <AvatarIcon
        pictureURL={profilePicture}
        firstLetterBackup={firstName.charAt(0)}
        secondLetterBackup={lastName.charAt(0)}
        size={70} // Tamaño ajustado
      />
      <div className={styles.details}>
        <div className={styles.mainDetails}>
          <h3 className={styles.name}>
            {firstName} {lastName}
          </h3>
          <p className={styles.email}>{email}</p>
          <p className={styles.role}>Role: {role}</p>
        </div>
        <div className={styles.memberSinceContainer}>
          <p className={styles.memberSince}>
            Member since: <span className={styles.date}>{formattedDate}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
