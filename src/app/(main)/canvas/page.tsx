import { Metadata } from "next";
import { CanvasList } from "@/components/canvas/CanvasList";
import { api } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import { Canvas as CanvasType } from "@/types";

export const metadata: Metadata = {
  title: "My Canvases - CanvasBookmarks",
  description: "キャンバス一覧",
};

export default async function CanvasListPage() {
  const canvasesRaw = await api.getCanvases();

  // 型を合わせる
  const canvases: CanvasType[] = canvasesRaw.map((c) => ({
    id: c.id,
    title: c.title,
    user_id: c.user_id,
    public: c.is_public,
    created_at: c.created_at,
    updated_at: c.updated_at ?? c.created_at,
  }));

  return (
    <AuthGuard>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">My Canvases</h1>
        <CanvasList canvases={canvases} />
      </div>
    </AuthGuard>
  );
}
