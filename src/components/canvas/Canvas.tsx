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
import { ShareDialog } from "./ShareDialog";
import { BookmarkDialog } from "./BookmarkDialog";
import { GroupDialog } from "./GroupDialog";
import { Canvas as CanvasType, Bookmark, Group } from "@/types";
import { Bookmark as SupabaseBookmark, BookmarkGroup } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { api } from "@/lib/supabase";

interface CanvasProps {
  canvas: CanvasType;
  bookmarks: Bookmark[];
  groups: Group[];
  isPublic?: boolean;
}

export function Canvas({
  canvas,
  bookmarks: initialBookmarks,
  groups: initialGroups,
  isPublic = false,
}: CanvasProps) {
  const [currentCanvas, setCurrentCanvas] = useState(canvas);
  const [title, setTitle] = useState(canvas.title);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [groups, setGroups] = useState(initialGroups);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [noGroupWarning, setNoGroupWarning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleCanvasUpdate = (updatedCanvas: CanvasType) => {
    setCurrentCanvas(updatedCanvas);
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

  const handleBookmarkSuccess = (bookmark: SupabaseBookmark) => {
    // 新規作成の場合は追加、編集の場合は更新
    setBookmarks((prev) => {
      const existingIndex = prev.findIndex((b) => b.id === bookmark.id);
      if (existingIndex >= 0) {
        // 更新
        return prev.map((b) =>
          b.id === bookmark.id
            ? {
                ...b,
                title: bookmark.name,
                url: bookmark.url,
                icon: bookmark.icon,
              }
            : b
        );
      } else {
        // 新規追加 - supabaseの型をtypesの型に変換
        const newBookmark: Bookmark = {
          id: bookmark.id,
          canvas_id: canvas.id,
          title: bookmark.name,
          url: bookmark.url,
          icon: bookmark.icon,
          position_x: bookmark.position_x || 0,
          position_y: bookmark.position_y || 0,
          created_at: bookmark.created_at || new Date().toISOString(),
          updated_at: bookmark.updated_at || new Date().toISOString(),
        };
        return [...prev, newBookmark];
      }
    });
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

  const handleGroupSuccess = (group: BookmarkGroup) => {
    // 新規作成の場合は追加、編集の場合は更新
    setGroups((prev) => {
      const existingIndex = prev.findIndex((g) => g.id === group.id);
      if (existingIndex >= 0) {
        // 更新
        return prev.map((g) =>
          g.id === group.id
            ? {
                ...g,
                title: group.name,
                position_x: group.position_x || 0,
                position_y: group.position_y || 0,
                width: group.width || 300,
                height: group.height || 200,
              }
            : g
        );
      } else {
        // 新規追加 - supabaseの型をtypesの型に変換
        const newGroup: Group = {
          id: group.id,
          canvas_id: group.canvas_id,
          title: group.name,
          position_x: group.position_x || 0,
          position_y: group.position_y || 0,
          width: group.width || 300,
          height: group.height || 200,
          created_at: group.created_at || new Date().toISOString(),
          updated_at: group.updated_at || new Date().toISOString(),
        };
        return [...prev, newGroup];
      }
    });
  };

  const handleGroupDelete = async (id: string) => {
    try {
      setLoading(true);
      setError("");

      // 削除するグループに属するブックマークのIDを取得
      const groupBookmarks = await api.getBookmarks(id);
      const bookmarkIds = groupBookmarks.map((bookmark) => bookmark.id);

      // APIを呼び出してグループを削除（ブックマークも一緒に削除される）
      await api.deleteGroup(id);

      // UIからグループを削除
      setGroups((prev) => prev.filter((group) => group.id !== id));

      // そのグループに属していたブックマークもUIから削除
      setBookmarks((prev) =>
        prev.filter((bookmark) => {
          // supabaseのbookmark型のIDとtypes/index.tsのBookmark型のIDを比較
          return !bookmarkIds.includes(bookmark.id);
        })
      );
    } catch (e: unknown) {
      console.error("グループ削除エラー:", e);
      if (e instanceof Error) {
        setError(`グループの削除に失敗しました: ${e.message}`);
      } else {
        setError("グループの削除に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkCreate = () => {
    // グループが存在するかチェック
    if (groups.length === 0) {
      setNoGroupWarning(true);
      // 3秒後に警告を非表示にする
      setTimeout(() => setNoGroupWarning(false), 3000);
      return;
    }
    setBookmarkDialogOpen(true);
  };

  return (
    <div className="h-full">
      {!isPublic && (
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
                  <Button
                    size="sm"
                    onClick={handleTitleSave}
                    disabled={loading}
                  >
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
              {error && (
                <div className="text-red-500 text-sm ml-2">{error}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmarkCreate}
              >
                <Plus className="h-4 w-4 mr-1" />
                新規ブックマーク
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGroupDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                新規グループ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareOpen(true)}
              >
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

          {/* グループ未作成時の警告メッセージ */}
          {noGroupWarning && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-amber-800 text-sm">
                <strong>
                  ブックマークを作成するには、まずグループを作成してください。
                </strong>
                <div className="mt-1">
                  上記の「新規グループ」ボタンをクリックしてグループを作成してからブックマークを追加できます。
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {!isPublic && (
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
              <AlertDialogCancel disabled={loading}>
                キャンセル
              </AlertDialogCancel>
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
      )}

      <div
        className={`canvas ${isPublic ? "canvas-public" : ""}`}
        ref={canvasRef}
      >
        {/* グループを描画 */}
        {groups.map((group) => (
          <GroupContainer
            key={group.id}
            group={group}
            onMove={handleGroupMove}
            onResize={handleGroupResize}
            onDelete={handleGroupDelete}
            isPublic={isPublic}
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
            isPublic={isPublic}
          />
        ))}
      </div>

      {/* 共有ダイアログ */}
      {!isPublic && (
        <ShareDialog
          canvas={currentCanvas}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          onUpdate={handleCanvasUpdate}
        />
      )}

      {/* ブックマーク作成・編集ダイアログ */}
      {!isPublic && (
        <BookmarkDialog
          isOpen={bookmarkDialogOpen}
          onClose={() => setBookmarkDialogOpen(false)}
          onSuccess={handleBookmarkSuccess}
          canvasId={canvas.id}
        />
      )}

      {/* グループ作成・編集ダイアログ */}
      {!isPublic && (
        <GroupDialog
          isOpen={groupDialogOpen}
          onClose={() => setGroupDialogOpen(false)}
          onSuccess={handleGroupSuccess}
          canvasId={canvas.id}
        />
      )}
    </div>
  );
}
