"use client";
import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const BackToHomeButton = () => {
  const router = useRouter();
  return (
    <Button
    variant={"secondary"}
      onClick={() => router.push("/")}
      className="py-2 px-4 rounded-md no-underline "
    >
      back
    </Button>
  );
};

export default BackToHomeButton;
