"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初回認証状態チェック
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/signin");
      } else {
        setLoading(false);
      }
    });

    // 認証状態の変化をリアルタイムで監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/signin");
      } else if (event === "SIGNED_IN" && session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) return null;

  return <>{children}</>;
}
