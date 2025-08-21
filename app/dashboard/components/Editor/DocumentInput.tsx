import { BsCloudCheck } from "react-icons/bs";

export const DocumentInput = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-lg px-1.5 cursor-pointer truncate text-[var(--black)] 
                   hover:bg-[var(--gray)]/10 rounded-sm transition-colors duration-200 
                   focus-visible:outline focus-visible:outline-2 
                   focus-visible:outline-[var(--light-green)]"
        title={title}
        tabIndex={0}
      >
        {title}
      </span>
      <BsCloudCheck
        className="text-[var(--strong-green)] transition-colors duration-200 hover:text-[var(--light-green)]"
        aria-label="Saved"
      />
    </div>
  );
};
