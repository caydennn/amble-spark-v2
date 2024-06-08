"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useEffect } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import ChatBottombar from "./chat-bottombar";
import { Match, Message, User } from "@/db/schema";
import { MessageRole } from "@/lib/enums";

interface ChatListProps {
  messages?: Message[];
  currentUser: User;
  match: Match;
  //   sendMessage: (newMessage: Message) => void;
  //   isMobile: boolean;
}

export function ChatList({ messages, currentUser, match }: ChatListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {

      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full h-full flex pt-12 flex-col items-center  justify-end overflow-y-auto">
      <div className="flex flex-col justify-end  md:w-1/2 max-h-full w-full overflow-y-auto">
        <div
          ref={messagesContainerRef}
          className="w-full overflow-y-auto overflow-x-hidden  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]  h-full flex flex-col"
        >
          <AnimatePresence>
            {messages?.map((message, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                transition={{
                  opacity: { duration: 0.1 },
                  layout: {
                    type: "spring",
                    bounce: 0.3,
                    duration: messages.indexOf(message) * 0.05 + 0.2,
                  },
                }}
                style={{
                  originX: 0.5,
                  originY: 0.5,
                }}
                className={cn(
                  "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                  message.role === MessageRole.user
                    ? `${
                        message.sentBy == currentUser.id
                          ? "items-end"
                          : "items-start"
                      }`
                    : "items-center"
                )}
              >
                <div className="flex gap-3 items-center">
                  <span
                    className={cn(
                      "p-3 rounded-md max-w-xs",
                      message.role === MessageRole.user
                        ? `${
                            message.sentBy == currentUser.id
                              ? "bg-orange-200"
                              : "bg-gray-600 text-white"
                          }`
                        : "bg-primary text-black lowercase"
                    )}
                  >
                    {message.role === MessageRole.assistant && (<span className="text-md font-semibold">spark: </span>)}
                    {message.content}
                  </span>
                  {/* {message.id !== currentUser.id && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage
                      src={message.avatar}
                      alt={message.name}
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )} */}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex justify-end  flex-col w-full  md:w-1/2">
        <ChatBottombar currentUserId={currentUser.id} matchId={match.id} />
      </div>
    </div>
  );
}
