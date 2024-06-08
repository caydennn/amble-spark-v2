"use client";
import AuthButton from "@/components/AuthButton";
import { ChatList } from "@/components/chat/chat-list";
import { Match, Message, User } from "@/db/schema";
import { MatchStatus } from "@/lib/enums";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
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
    const msgChannelTopic = `match-msgs:${match.id}`;
    const statusChannelTopic = `match-status:${match.id}`;
    const channels = supabase.getChannels();
    let msgChannel: RealtimeChannel | null = null;
    let matchStatusChannel: RealtimeChannel | null = null;
    console.log(channels);
    // only subscribe if not already subscribed

    if (!channels.find((c) => c.subTopic === msgChannelTopic)) {
      console.log("subscribing to msgChannel", msgChannelTopic);
      const channel = supabase
        .channel(msgChannelTopic)
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
      msgChannel = channel;
    }

    if (!channels.find((c) => c.subTopic === statusChannelTopic)) {
      console.log("subscribing to statusChannel", statusChannelTopic);
      const channel = supabase
        .channel(statusChannelTopic)
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
              alert("this match has ended");
              router.replace("/");
            }
          }
        )
        .subscribe();
      matchStatusChannel = channel;
    }

    // const channel = supabase
    //   .channel(msgChannelTopic)
    //   .on(
    //     "postgres_changes",
    //     {
    //       event: "INSERT",
    //       schema: "public",
    //       table: "messages",
    //     },
    //     (payload) => {
    //       console.log(payload);
    //       setMessages((prev) => prev.concat(payload.new as Message));
    //     }
    //   )

    //   .subscribe();

    return () => {
      console.log(supabase.getChannels());
      if (msgChannel) supabase.removeChannel(msgChannel);
      if (matchStatusChannel) supabase.removeChannel(matchStatusChannel);

      // const presenceChannel = supabase
      //   .getChannels()
      //   .find((c) => c.subTopic.includes(`match-presence:${match.id}`));
      // if (presenceChannel) {
      //   console.log("removing presence channel", presenceChannel?.topic);
      //   presenceChannel.untrack();
      //   supabase.removeChannel(presenceChannel);
      // }
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
