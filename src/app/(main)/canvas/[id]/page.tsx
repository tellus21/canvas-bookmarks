import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Canvas } from "@/components/canvas/Canvas";
import { api } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import { Group, Bookmark, Canvas as CanvasType } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const canvas = await api.getCanvas(id);

  if (!canvas) {
    return {
      title: "キャンバスが見つかりません",
    };
  }

  return {
    title: `${canvas.title} - CanvasBookmarks`,
    description: `キャンバス: ${canvas.title}`,
  };
}

export default async function CanvasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const canvasData = await api.getCanvas(id);

  if (!canvasData) {
    notFound();
  }

  // Canvas型にマッピング
  const canvas: CanvasType = {
    id: canvasData.id,
    title: canvasData.title,
    user_id: canvasData.user_id,
    public: canvasData.is_public, // DBはis_public、型はpublic
    created_at: canvasData.created_at,
    updated_at: canvasData.updated_at ?? canvasData.created_at,
  };

  // グループ一覧を取得
  const groupData = await api.getGroups(id);
  // Group型にマッピング
  const groups: Group[] = groupData.map((g) => ({
    id: g.id,
    canvas_id: g.canvas_id,
    title: g.name, // DBはname、型はtitle
    position_x: g.position_x ?? 0,
    position_y: g.position_y ?? 0,
    width: g.width ?? 300,
    height: g.height ?? 200,
    created_at: g.created_at ?? "",
    updated_at: g.updated_at ?? "",
    bookmarks: [],
  }));

  // 各グループごとにブックマークを取得し、Bookmark型にマッピング
  const bookmarks: Bookmark[] = (
    await Promise.all(
      groups.map(async (group) => {
        const groupBookmarks = await api.getBookmarks(group.id);
        return groupBookmarks.map((b) => ({
          id: b.id,
          canvas_id: group.canvas_id,
          title: b.name, // DBはname、型はtitle
          url: b.url,
          icon: b.icon,
          position_x: b.position_x ?? 0,
          position_y: b.position_y ?? 0,
          created_at: b.created_at ?? "",
          updated_at: b.updated_at ?? "",
        }));
      })
    )
  ).flat();

  return (
    <AuthGuard>
      <div className="h-full">
        <Canvas canvas={canvas} bookmarks={bookmarks} groups={groups} />
      </div>
    </AuthGuard>
  );
}
