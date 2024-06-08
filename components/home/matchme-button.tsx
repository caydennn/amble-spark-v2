"use client";

import { useFormStatus } from "react-dom";
import { ReactNode, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
type MatchMeButtonProps = {
  children: React.ReactNode;
};
export const MatchMeButton: React.FC<MatchMeButtonProps> = ({ children }) => {
  const { pending } = useFormStatus();

  return <Button className="w-[200px] group">{pending ? 'loading' : children}</Button>;
};
