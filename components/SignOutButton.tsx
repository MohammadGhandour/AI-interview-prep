"use client";

import { signOut } from "@/lib/actions/auth.action";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const SignOutButton = () => {
  const router = useRouter();

  const handleSignout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return <button className="cursor-pointer" onClick={handleSignout}><LogOut size={16} /></button>
};

export default SignOutButton;
