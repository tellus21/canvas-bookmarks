"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, BookmarkGroup } from "@/lib/supabase";

export default function BookmarkNewPage() {
  const router = useRouter();
  const params = useParams();
  const canvasId = params?.id as string;
  const [groups, setGroups] = useState<BookmarkGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canvasId) return;
    api.getGroups(canvasId).then((data) => {
      setGroups(data);
      if (data.length > 0) setGroupId(data[0].id);
    });
  }, [canvasId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!groupId || !title.trim() || !url.trim()) {
      setError("全ての必須項目を入力してください");
      return;
    }
    setLoading(true);
    try {
      await api.addBookmark({
        group_id: groupId,
        name: title.trim(),
        url: url.trim(),
        icon: icon.trim() || "",
      });
      router.push(`/canvas/${canvasId}`);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else if (typeof e === "object" && e !== null && "message" in e) {
        setError((e as { message?: string }).message || "作成に失敗しました");
      } else {
        setError("作成に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">新規ブックマーク作成</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">グループ</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">タイトル</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">URL</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            type="url"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">アイコンURL（任意）</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            type="url"
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "作成中..." : "作成"}
        </button>
      </form>
    </div>
  );
}
