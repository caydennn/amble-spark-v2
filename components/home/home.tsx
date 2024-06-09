import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { handleMatching } from "@/app/actions";
import { MatchMeButton } from "./matchme-button";
import { Typography } from "../ui/typography";
import {
  BotIcon,
  ExternalLink,
  Link2Icon,
  LinkIcon,
  Sparkles,
} from "lucide-react";
import { getActiveUserMatches } from "@/db/operations";
import Link from "next/link";
import { Button } from "../ui/button";
import plug from "@/assets/plug.png";
import Image from "next/image";
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
    <div className="flex-1 w-full flex flex-col gap-10 md:px-6 px-4">
      <div className="flex flex-col w-full ">
        <Typography variant="h1">hey, {user.user_metadata.name}</Typography>
        <Typography variant="lead">
          ready to spark your next connection?
        </Typography>
      </div>
      {!activeMatches && (
        <form
          action={handleMatchingWithId}
          className="flex flex-col text-gray-400"
        >
          <MatchMeButton>
            MATCH ME
            <Sparkles
              size={24}
              className="text- ml-2 transition-transform group-hover:rotate-12 group-hover:scale-110"
            />
          </MatchMeButton>
          <i className="mt-2">
            *you might not be able to get matched if there's no one else online
            at the moment!
          </i>
        </form>
      )}
      {activeMatches && activeMatches.matches && (
        <div>
          <Button asChild variant={"secondary"}>
            <Link
              href={`/matches/${activeMatches.matches.id}`}
              className="group text-white"
            >
              go to active match
              <Sparkles
                size={24}
                className="text-white ml-2 transition-transform group-hover:rotate-12 group-hover:scale-110"
              />
            </Link>
          </Button>
        </div>
      )}

      <div className="flex w-full  flex-col relative text-center justify-center h-1/2">
        <Image
          src={plug}
          alt="plug"
          width={0}
          height={0}
          className="w-full h-auto rounded-2xl shadow-lg"
        />
      </div>
      <div className="flex justify-center space-x-4">
        <Button asChild className="bg-[#C86868]">
          <Link
            href="https://t.me/ambleprojectbot"
            className="flex text-center   w-[200px] self-center justify-center  rounded-lg text-bold"
          >
            meet other amblers <BotIcon className="ml-2" />
          </Link>
        </Button>
        <Button asChild variant={"outline"}>
          <Link
            href="https://ambleproject.com"
            className="flex text-center w-[200px] self-center justify-center text-secondary rounded-lg text-bold"
          >
            learn more
            <ExternalLink className="ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;
