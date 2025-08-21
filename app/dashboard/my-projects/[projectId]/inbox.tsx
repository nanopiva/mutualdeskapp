"use client";

import { BellIcon } from "lucide-react";
import { InboxNotification, InboxNotificationList } from "@liveblocks/react-ui";
import { useInboxNotifications } from "@liveblocks/react/suspense";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { Separator } from "@/components/ui/separator";

import "@liveblocks/react-ui/styles.css";

export const Inbox = () => {
  return (
    <ClientSideSuspense
      fallback={
        <>
          <Button
            variant="ghost"
            className="relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--light-green)]"
            size="icon"
            disabled
            aria-label="Notifications"
          >
            <BellIcon className="size-5 text-[var(--gray)]" />
          </Button>
          <Separator
            orientation="vertical"
            className="h-6 bg-[var(--input-border)]"
          />
        </>
      }
    >
      <InboxMenu />
    </ClientSideSuspense>
  );
};

const InboxMenu = () => {
  const { inboxNotifications } = useInboxNotifications();
  const count = inboxNotifications?.length ?? 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--light-green)]"
            size="icon"
            aria-label="Notifications"
          >
            <BellIcon className="size-5 text-[var(--black)]" />
            {count > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full
                           bg-[var(--strong-green)] text-[var(--white)]
                           text-[10px] leading-4 font-medium
                           flex items-center justify-center"
                aria-label={`${count} notifications`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[360px] max-w-[80vw]
                     border border-[var(--input-border)]
                     bg-[var(--white)] text-[var(--black)]
                     rounded-xl shadow-lg p-0 overflow-hidden"
        >
          {count > 0 ? (
            <div className="max-h-[60vh] overflow-auto">
              <InboxNotificationList className="[&_*]:text-[inherit]">
                {inboxNotifications!.map((n) => (
                  <InboxNotification
                    key={n.id}
                    inboxNotification={n}
                    className="hover:bg-[var(--gray)]/05 focus:bg-[var(--gray)]/10"
                  />
                ))}
              </InboxNotificationList>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-[var(--gray)]">
              No notifications found
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator
        orientation="vertical"
        className="h-6 bg-[var(--input-border)]"
      />
    </>
  );
};
