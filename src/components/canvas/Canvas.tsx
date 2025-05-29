"use client";

import { useState, useRef } from "react";
import { Share, Plus, Save, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookmarkCard } from "./BookmarkCard";
import { GroupContainer } from "./GroupContainer";
import { Canvas as CanvasType, Bookmark, Group } from "@/types";
import { useRouter } from "next/navigation";
import { api } from "@/lib/supabase";

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleSave = async () => {
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.updateCanvas(canvas.id, {
        title: title.trim(),
      });
      setIsEditing(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("タイトルの更新に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("キャンバス削除開始:", canvas.id);
      await api.deleteCanvas(canvas.id);
      console.log("キャンバス削除成功:", canvas.id);
      router.push("/canvas");
    } catch (e: unknown) {
      console.error("キャンバス削除エラー:", e);
      if (e instanceof Error) {
        console.error("エラーメッセージ:", e.message);
        setError(`キャンバスの削除に失敗しました: ${e.message}`);
      } else {
        console.error("不明なエラー:", e);
        setError("キャンバスの削除に失敗しました");
      }
    } finally {
      setLoading(false);
    }
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

  const handleBookmarkUpdate = (
    id: string,
    updatedBookmark: Partial<Bookmark>
  ) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, ...updatedBookmark } : bookmark
      )
    );
  };

  const handleBookmarkDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
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
                  disabled={loading}
                />
                <Button size="sm" onClick={handleTitleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-1" />
                  {loading ? "保存中..." : "保存"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(canvas.title);
                    setError("");
                  }}
                  disabled={loading}
                >
                  キャンセル
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
            {error && <div className="text-red-500 text-sm ml-2">{error}</div>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/canvas/${canvas.id}/bookmark/new`)}
            >
              <Plus className="h-4 w-4 mr-1" />
              新規ブックマーク
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/canvas/${canvas.id}/group/new`)}
            >
              <Plus className="h-4 w-4 mr-1" />
              新規グループ
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-1" />
              共有
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  設定
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  タイトルを編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  キャンバスを削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>キャンバスを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{canvas.title}」を削除します。この操作は取り消せません。
              キャンバス内のすべてのブックマークとグループも削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded border">
              {error}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "削除中..." : "削除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            onUpdate={handleBookmarkUpdate}
            onDelete={handleBookmarkDelete}
          />
        ))}
      </div>
    </div>
  );
}
