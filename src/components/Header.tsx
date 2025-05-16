import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MOCK_USER } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const user = MOCK_USER;

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
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
