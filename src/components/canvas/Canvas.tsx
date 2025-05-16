"use client";

import { useState, useRef } from "react";
import { Share, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookmarkCard } from "./BookmarkCard";
import { GroupContainer } from "./GroupContainer";
import { Canvas as CanvasType, Bookmark, Group } from "@/types";

interface CanvasProps {
  canvas: CanvasType;
  bookmarks: Bookmark[];
  groups: Group[];
}

export function Canvas({
  canvas,
  bookmarks: initialBookmarks,
  groups: initialGroups,
}: CanvasProps) {
  const [title, setTitle] = useState(canvas.title);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [groups, setGroups] = useState(initialGroups);
  const [isEditing, setIsEditing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleSave = () => {
    setIsEditing(false);
    // ここでタイトルを保存するAPIを呼び出す
  };

  const handleBookmarkMove = (id: string, x: number, y: number) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, position_x: x, position_y: y }
          : bookmark
      )
    );
  };

  const handleGroupMove = (id: string, x: number, y: number) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id ? { ...group, position_x: x, position_y: y } : group
      )
    );
  };

  const handleGroupResize = (id: string, width: number, height: number) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id ? { ...group, width, height } : group
      )
    );
  };

  return (
    <div className="h-full">
      <div className="container py-4 border-b sticky top-16 bg-background z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={handleTitleChange}
                  className="w-96"
                  autoFocus
                />
                <Button size="sm" onClick={handleTitleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  保存
                </Button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:bg-secondary hover:bg-opacity-50 px-2 py-1 rounded"
                onClick={() => setIsEditing(true)}
              >
                {title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              新規ブックマーク
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              新規グループ
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-1" />
              共有
            </Button>
          </div>
        </div>
      </div>

      <div className="canvas" ref={canvasRef}>
        {/* グループを描画 */}
        {groups.map((group) => (
          <GroupContainer
            key={group.id}
            group={group}
            onMove={handleGroupMove}
            onResize={handleGroupResize}
          />
        ))}

        {/* ブックマークカードを描画 */}
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onMove={handleBookmarkMove}
          />
        ))}
      </div>
    </div>
  );
}
