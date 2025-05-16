import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Canvas } from "@/components/canvas/Canvas";
import { api } from "@/lib/supabase";

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
  const canvas = await api.getCanvas(id);

  if (!canvas) {
    notFound();
  }

  const bookmarks = await api.getBookmarks(id);
  const groups = await api.getGroups(id);

  return (
    <div className="h-full">
      <Canvas canvas={canvas} bookmarks={bookmarks} groups={groups} />
    </div>
  );
}
