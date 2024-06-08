"use client";
import { LoaderIcon } from "lucide-react";
import React, { useEffect } from "react";
import { handleMatching } from "../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@/db/schema";
import { getActiveUserMatches, removeFromQueue } from "@/db/operations";
import Lottie from "lottie-react";
import queue_circle from "@/assets/queue_circle.json";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic'


const QueuePage = () => {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const router = useRouter();

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
          const matches = await getActiveUserMatches(user.id);
          if (matches.length > 0) {
            console.log("joining queue from queue page via realtime ")
            router.replace(`/matches/${matches[0].matches?.id}`);
          }
        }
      }
    );
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("subscribed to channel", channel);
      }
    });

    return () => {
      channel.unsubscribe();
      if (userId) removeFromQueue(userId);
    };
  }, [userId]);

  if (!userId)
    return (
      <div>
        oops!
        <br />
        something went wrong. try logging in again to get back to the queue.
        <Link href="/">go home</Link>
      </div>
    );
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-8 ">
      <div className="relative w-48 h-48">
        {/* <LoaderIcon className="absolute inset-0 w-full h-full text-primary" /> */}
        <Lottie animationData={queue_circle} size={56} loop={true} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">sit tight...</h2>
        <p className="text-gray-500 dark:text-gray-400">
          finding the perfect spark for you ✨
        </p>
      </div>
      <Button
        onClick={async () => {
          await removeFromQueue(userId);
          router.replace("/");
        }}
      >
        cancel
      </Button>
    </div>
  );
};

export default QueuePage;
