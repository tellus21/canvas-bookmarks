"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const email = user?.email ?? "";
  const displayName = user?.user_metadata?.display_name ?? email;
  const avatarText = displayName.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            CanvasBookmarks
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/canvas">My Canvases</Link>
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback>{avatarText}</AvatarFallback>
              </Avatar>
              <span>{displayName}</span>
            </div>
          ) : (
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
