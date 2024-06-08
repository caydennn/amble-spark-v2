"use client";
import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

const BackToHomeButton = () => {
  const router = useRouter();
  return (
    <Button
      variant={"ghost"}
      onClick={() => router.push("/")}
      className="py-2 px-4 rounded-md no-underline"
    >
      <ArrowLeftIcon />
    </Button>
  );
};

export default BackToHomeButton;
