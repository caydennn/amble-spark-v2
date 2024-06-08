import Home from "@/components/home/home";
import Landing from "@/components/home/landing";
import { createClient } from "@/utils/supabase/server";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import AuthButton from "../components/AuthButton";

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center h-vh">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm group">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles
              size={24}
              className="text-primary transition-transform group-hover:rotate-12 group-hover:scale-125"
            />
            <span className="font-semibold text-primary text-lg">amble spark</span>
          </Link>
          {user  && <AuthButton />}
        </div>
      </nav>

      <main className="w-full flex-1 flex flex-col  max-w-4xl">
        {!user && <Landing />}
        {user && <Home />}
      </main>
      {/* </div> */}
    </div>
  );
}
