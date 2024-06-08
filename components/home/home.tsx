import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { handleMatching } from "@/app/actions";
import { MatchMeButton } from "./matchme-button";
import { Typography } from "../ui/typography";
import { Sparkles } from "lucide-react";
import { getActiveUserMatches } from "@/db/operations";
import Link from "next/link";
import { Button } from "../ui/button";
const Home = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("no user found");
    return redirect("/login");
  }

  const handleMatchingWithId = handleMatching.bind(null, user.id);
  const [activeMatches] = await getActiveUserMatches(user.id);
  console.log(activeMatches);
  return (
    <div className="flex-1 w-full flex flex-col gap-10">
      <div className="flex flex-col w-full">
        <Typography variant="h1">hey, {user.user_metadata.name}</Typography>
        <Typography variant="lead">
          ready to spark your next connection?
        </Typography>
      </div>
      {!activeMatches && (
        <form action={handleMatchingWithId}>
          <MatchMeButton>
            match me
            <Sparkles
              size={24}
              className="text-white ml-2 transition-transform group-hover:rotate-12 group-hover:scale-110"
            />
          </MatchMeButton>
        </form>
      )}
      {activeMatches && activeMatches.matches && (
        <div>
          <Button asChild variant={"secondary"} >
            <Link href={`/matches/${activeMatches.matches.id}`} className="group text-white">
              go to active match
              <Sparkles
                size={24}
                className="text-white ml-2 transition-transform group-hover:rotate-12 group-hover:scale-110"
              />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
