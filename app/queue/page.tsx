"use client";
import { LoaderIcon } from "lucide-react";
import React, { useEffect } from "react";
import { handleMatching } from "../actions";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@/db/schema";
import { getActiveUserMatches } from "@/db/operations";

const QueuePage = () => {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const userId = searchParams.get("userId");

  useEffect(() => {
    if (!userId) return;
    // fallback: handle matching every 10 seconds to check if the user has been matched
    const interval = setInterval(() => {
      handleMatching(userId);
      console.log("handled");
    }, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    console.log(supabase.getChannels());
    const channel = supabase.channel(`user-status:${userId}`).on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: `id=eq.${userId}`,
      },
      async (payload) => {
        console.log(payload);
        const user = payload.new as User;
        if (user.inQueue === false) {
          // get the active match
          await getActiveUserMatches(user.id);
        }
      }
    );
    console.log("subscribed to channel", channel);
    return () => {
      channel.unsubscribe();
    };
  }, [userId]);
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-8 bg-gray-100 dark:bg-gray-950">
      <div className="relative w-32 h-32 animate-[spin_3s_linear_infinite]">
        <LoaderIcon className="absolute inset-0 w-full h-full text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Matching in progress</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we find the perfect match for you.
        </p>
      </div>
    </div>
  );
};

export default QueuePage;
