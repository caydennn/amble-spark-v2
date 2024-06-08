import { Message } from "@/db/schema";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "@/db/db";
import { matchUsers, messages, matches } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUserMessagesInSequence({
  currentUserMsgs,
  otherUserMsgs,
}: {
  currentUserMsgs: Message[];
  otherUserMsgs: Message[];
}) {
  // sort these messages by createdAt
  const combined = [...currentUserMsgs, ...otherUserMsgs].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  // output should be in the format of
  // User A: message
  // User B: message
  // ...
  return combined
    .map((msg) => {
      return `User ${msg.sentBy}: ${msg.content}`;
    })
    .join("\n");
}

export const generatePlaceholderImage = (
  text: string,
  size: string = "300x300"
) => {
  const PlaceholderApi = "https://placehold.co";
  const letter = text.length > 0 ? text[0].toLowerCase() : "a";
  const background = "FFE8D2";
  // const background = Colors.light.secondary.split("#")[1];
  // const textColor = "9E6A4E";
  const textColor = "C65E74";
  const font = "Lora";
  const url = `${PlaceholderApi}/${size}/${background}/${textColor}/png?text=${letter}&font=${font}`;
  return url;
};
