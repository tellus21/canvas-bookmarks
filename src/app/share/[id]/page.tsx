import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Canvas } from "@/components/canvas/Canvas";
import { api } from "@/lib/supabase";
import { Group, Bookmark, Canvas as CanvasType } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const canvas = await api.getPublicCanvas(id);

  if (!canvas) {
    return {
      title: "共有キャンバスが見つかりません",
    };
  }

  return {
    title: `${canvas.title} - 共有キャンバス`,
    description: `共有キャンバス: ${canvas.title}`,
  };
}

export default async function PublicCanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const canvasData = await api.getPublicCanvas(id);

  if (!canvasData) {
    notFound();
  }

  // Canvas型にマッピング
  const canvas: CanvasType = {
    id: canvasData.id,
    title: canvasData.title,
    user_id: canvasData.user_id,
    public: canvasData.public,
    created_at: canvasData.created_at,
    updated_at: canvasData.updated_at || canvasData.created_at,
  };

  // グループ一覧を取得
  const groupData = await api.getGroups(id);
  const groups: Group[] = groupData.map((g) => ({
    id: g.id,
    canvas_id: g.canvas_id,
    title: g.name,
    position_x: g.position_x ?? 0,
    position_y: g.position_y ?? 0,
    width: g.width ?? 300,
    height: g.height ?? 200,
    created_at: g.created_at ?? "",
    updated_at: g.updated_at ?? "",
    bookmarks: [],
  }));

  // 各グループごとにブックマークを取得
  const bookmarks: Bookmark[] = (
    await Promise.all(
      groups.map(async (group) => {
        const groupBookmarks = await api.getBookmarks(group.id);
        return groupBookmarks.map((b) => ({
          id: b.id,
          canvas_id: group.canvas_id,
          title: b.name,
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
    <div className="h-screen">
      {/* 公開キャンバス表示のヘッダー */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-blue-700 font-medium">
              公開キャンバス: {canvas.title}
            </span>
          </div>
          <span className="text-xs text-blue-600">閲覧専用モード</span>
        </div>
      </div>

      {/* キャンバス表示（認証ガード無し） */}
      <div className="h-full">
        <Canvas
          canvas={canvas}
          bookmarks={bookmarks}
          groups={groups}
          isPublic={true}
        />
      </div>
    </div>
  );
}
