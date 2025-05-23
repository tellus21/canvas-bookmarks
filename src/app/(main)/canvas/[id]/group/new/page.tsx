"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/supabase";

export default function GroupNewPage() {
  const router = useRouter();
  const params = useParams();
  const canvasId = params?.id as string;
  const [name, setName] = useState("");
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("グループ名を入力してください");
      return;
    }
    setLoading(true);
    try {
      await api.addGroup({
        canvas_id: canvasId,
        name: name.trim(),
        position_x: positionX,
        position_y: positionY,
        width,
        height,
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
      <h1 className="text-2xl font-bold mb-4">新規グループ作成</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">グループ名</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-2">
          <div>
            <label className="block mb-1 font-medium">X座標</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={positionX}
              onChange={(e) => setPositionX(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Y座標</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={positionY}
              onChange={(e) => setPositionY(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <label className="block mb-1 font-medium">幅</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">高さ</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>
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
