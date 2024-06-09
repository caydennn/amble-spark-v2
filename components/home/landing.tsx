import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import hero from "@/assets/hero.svg";
import Image from "next/image";

const Landing = () => {
  return (
    <div className="animate-in  gap-20 opacity-100 px-3">
      <section className="w-full py-6 md:py-24 lg:py-32 xl:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_550px] lowercase">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Unlock the Power of Meaningful Conversations
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Amble Spark empowers you to engage in deep, thoughtful
                  dialogues powered by advanced AI, opening new paths for
                  personal growth and self-discovery.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild>
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 dark:bg-primary dark:text-gray-50 dark:hover:bg-primary/90 dark:focus-visible:ring-primary"
                    prefetch={false}
                  >
                    get started
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              // src="/placeholder.svg"
              src={hero}
              width="550"
              height="550"
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
