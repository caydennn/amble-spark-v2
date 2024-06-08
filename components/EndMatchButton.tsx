import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { db } from "@/db/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MatchStatus } from "@/lib/enums";

export default async function EndMatchButton({ matchId }: { matchId: number }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const leaveMatch = async () => {
    "use server";

    const supabase = createClient();
    await db
      .update(matches)
      .set({ status: MatchStatus.ended })
      .where(eq(matches.id, matchId))
      .execute();

    return redirect("/");
  };

  return user ? (
    <div className="flex items-center gap-4">
      <form action={leaveMatch}>
        <Button className="py-2 px-4 rounded-md no-underline ">
          leave match
        </Button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
    >
      Login
    </Link>
  );
}
