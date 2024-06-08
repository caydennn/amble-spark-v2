import { db } from "@/db/db";
import { createClient } from "@/utils/supabase/server";

import RealtimeMessages from "./realtime-msgs";
import AuthButton from "@/components/AuthButton";
import { matchUsers, matches, users } from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import EndMatchButton from "@/components/EndMatchButton";
import BackToHomeButton from "@/components/BackToHomeButton";
import { generatePlaceholderImage } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // get match messages
  const serverMessages = await db.query.messages
    .findMany({
      where: (messages, { eq }) => eq(messages.matchId, Number(params.id)),
    })
    .execute();

  const { data: currentUser } = await supabase.auth.getUser();

  if (!currentUser) {
    console.warn(["matches page"] + "no user found");
    // redirect("/login");
    return;
  }
  const match = await db
    .select()
    .from(matches)
    .where(eq(matches.id, Number(params.id)))
    .innerJoin(matchUsers, eq(matchUsers.matchId, matches.id))
    .innerJoin(users, eq(users.id, matchUsers.userId))
    .execute();

  if (match.length < 2) {
    return <div>Match not found</div>;
  }
  const otherUser = match.filter((u) => u.users.id !== currentUser.user!.id)[0]
    .users;
  // console.log("match", match);

  const currentMatch = match[0]?.matches;

  const avatar = generatePlaceholderImage(otherUser.name || "a", "256x256");

  return (
    <div className="flex flex-col  w-full h-dvh">
      {currentMatch && (
        <div className="flex flex-col h-full  justify-end">
          <div className="absolute top-0 bg-accent w-full flex justify-around min-h-[50px] items-center font-bold">
            <BackToHomeButton />
            <div className="flex flex-row space-x-2 items-center">
              <Avatar className="flex justify-center items-center">
                <AvatarImage
                  src={avatar}
                  alt={otherUser.name || "a"}
                  width={6}
                  height={6}
                />
              </Avatar>
              <div>{otherUser.name}</div>
            </div>
            <EndMatchButton matchId={currentMatch.id} />
          </div>
          <RealtimeMessages
            serverMessages={serverMessages}
            match={currentMatch}
          />
        </div>
      )}
    </div>
  );
}
