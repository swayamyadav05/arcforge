"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({
  className,
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      window.location.href = "/";
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={cn(
        "text-sm text-purple-400/60 hover:text-purple-300 transition-colors disabled:opacity-50",
        className,
      )}>
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
