"use client";
import { useEffect, useState } from "react";
import { CanvasList } from "@/components/canvas/CanvasList";
import { api, supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import { Canvas as CanvasType } from "@/types";

export default function CanvasListPage() {
  const [canvases, setCanvases] = useState<CanvasType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCanvases = async () => {
      try {
        // 現在のユーザーを取得
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("ユーザー取得エラー:", userError);
          setCanvases([]);
          setLoading(false);
          return;
        }

        // ユーザーのキャンバスのみを取得
        const canvasesRaw = await api.getCanvases(user.id);

        // 型を合わせる
        const userCanvases: CanvasType[] = canvasesRaw.map((c) => ({
          id: c.id,
          title: c.title,
          user_id: c.user_id,
          public: c.public,
          created_at: c.created_at,
          updated_at: c.updated_at ?? c.created_at,
        }));

        setCanvases(userCanvases);
      } catch (error) {
        console.error("キャンバス取得エラー:", error);
        setCanvases([]);
      } finally {
        setLoading(false);
      }
    };

    // 初回実行
    fetchUserCanvases();

    // 認証状態の変化を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // ログイン時にキャンバスを再読み込み
        setLoading(true);
        fetchUserCanvases();
      } else if (event === "SIGNED_OUT") {
        // ログアウト時にキャンバスをクリア
        setCanvases([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-6">My Canvases</h1>
          <p>読み込み中...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">My Canvases</h1>
        <CanvasList canvases={canvases} />
      </div>
    </AuthGuard>
  );
}
