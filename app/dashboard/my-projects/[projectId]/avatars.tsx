"use client";

import { Separator } from "@/components/ui/separator";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { useOthers, useSelf } from "@liveblocks/react/suspense";

const AVATAR_SIZE = 36;

export const Avatars = () => {
  return (
    <ClientSideSuspense fallback={null}>
      <AvatarStack />
    </ClientSideSuspense>
  );
};

const AvatarStack = () => {
  const users = useOthers();
  const currentUser = useSelf();

  if (users.length === 0) return null;

  return (
    <>
      <div className="flex items-center">
        {currentUser && (
          <div className="relative ml-2">
            <Avatar src={currentUser.info.avatar} name="You" />
          </div>
        )}
        <div className="flex">
          {users.map(({ connectionId, info }) => (
            <Avatar key={connectionId} src={info.avatar} name={info.name} />
          ))}
        </div>
      </div>

      <Separator
        orientation="vertical"
        className="h-6 bg-[var(--input-border)] mx-2 shrink-0"
      />
    </>
  );
};

interface AvatarProps {
  src: string;
  name: string;
}

const Avatar = ({ src, name }: AvatarProps) => {
  return (
    <div
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      className="group ml-2 flex shrink-0 place-content-center relative 
                 border-2 border-[var(--white)] rounded-full 
                 bg-[var(--gray)]/40 
                 ring-0 hover:ring-2 hover:ring-[var(--strong-green)] hover:ring-offset-1 hover:ring-offset-[var(--white)] 
                 transition-all duration-200"
      title={name}
    >
      <div
        className="opacity-0 group-hover:opacity-100 absolute top-full mt-2.5 z-10 
                   px-2 py-1 text-xs rounded-lg whitespace-nowrap 
                   bg-[var(--black)] text-[var(--white)] 
                   transition-opacity"
        role="tooltip"
      >
        {name}
      </div>
      <img
        alt={name}
        src={src}
        className="size-full rounded-full object-cover"
        loading="lazy"
      />
    </div>
  );
};
