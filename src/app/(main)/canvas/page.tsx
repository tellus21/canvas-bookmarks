import { Metadata } from "next";
import { CanvasList } from "@/components/canvas/CanvasList";
import { api } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "My Canvases - CanvasBookmarks",
  description: "キャンバス一覧",
};

export default async function CanvasListPage() {
  const canvases = await api.getCanvases();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Canvases</h1>
      <CanvasList canvases={canvases} />
    </div>
  );
}
