"use client";
import AuthButton from "@/components/AuthButton";
import { ChatList } from "@/components/chat/chat-list";
import { Match, Message, User } from "@/db/schema";
import { MatchStatus } from "@/lib/enums";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const RealtimeMessages = ({
  serverMessages,
  match,
}: {
  serverMessages: Message[];
  match: Match;
}) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([...serverMessages]);

  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return router.replace("/login");
      }

      const { data: currentUser, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error(error);
        return;
      }

      setCurrentUser(currentUser);
    }
    getCurrentUser();
  }, []);

  useEffect(() => {
    console.log("subscribing to channel", match.id);
    console.log(supabase.getChannels());
    const channel = supabase
      .channel(`match-msgs:${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log(payload);
          setMessages((prev) => prev.concat(payload.new as Message));
        }
      )
      .subscribe();

    const matchStatusChannel = supabase
      .channel(`match-status:${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${match.id}`,
        },
        (payload) => {
          console.log("match status changed", payload);
          if (payload.new.status === MatchStatus.ended) {
            alert("this match has ended")
            router.replace("/");
          }
        }
      )
      .subscribe();

    console.log("subscribed to channel", channel.topic);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(matchStatusChannel);
    };
  }, [supabase, messages, setMessages]);
  return (
    // <div className="flex flex-col justify-end w-full">
    <>
      {currentUser && (
        <ChatList currentUser={currentUser} messages={messages} match={match} />
      )}
    </>
    // </div>
  );
};

export default RealtimeMessages;
