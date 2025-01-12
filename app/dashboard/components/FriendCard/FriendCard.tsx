import styles from "./FriendCard.module.css";
import AvatarIcon from "../AvatarIcon/AvatarIcon";

interface FriendCardProps {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  created_at: Date;
  friend_since: Date;
}

export default function FriendCard({
  firstName,
  lastName,
  email,
  profilePicture,
  created_at,
  friend_since,
}: FriendCardProps) {
  const formattedCreatedDate = new Date(created_at).toLocaleDateString();
  const formattedFriendSinceDate = new Date(friend_since).toLocaleDateString();

  return (
    <div className={styles.card}>
      <AvatarIcon
        pictureURL={profilePicture}
        firstLetterBackup={firstName.charAt(0)}
        secondLetterBackup={lastName.charAt(0)}
        size={70}
      />
      <div className={styles.details}>
        <div>
          <h3 className={styles.name}>
            {firstName} {lastName}
          </h3>
          <p className={styles.email}>{email}</p>
        </div>
        <div className={styles.memberSinceContainer}>
          <p className={styles.memberSince}>
            Member since:{" "}
            <span className={styles.date}>{formattedCreatedDate}</span>
          </p>
          <p className={styles.memberSince}>
            Friends since:{" "}
            <span className={styles.date}>{formattedFriendSinceDate}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
