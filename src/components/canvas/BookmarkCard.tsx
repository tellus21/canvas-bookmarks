"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { MoreVertical, Edit, Trash2, ExternalLink, Globe } from "lucide-react";
import { Bookmark } from "@/types";
import { api } from "@/lib/supabase";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onMove: (id: string, x: number, y: number) => void;
  onUpdate?: (id: string, updatedBookmark: Partial<Bookmark>) => void;
  onDelete?: (id: string) => void;
  isPublic?: boolean;
}

export function BookmarkCard({
  bookmark,
  onMove,
  onUpdate,
  onDelete,
  isPublic = false,
}: BookmarkCardProps) {
  const [position, setPosition] = useState({
    x: bookmark.position_x,
    y: bookmark.position_y,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 編集フォームの状態
  const [editTitle, setEditTitle] = useState(bookmark.title);
  const [editUrl, setEditUrl] = useState(bookmark.url);
  const [editIcon, setEditIcon] = useState(bookmark.icon || "");

  const cardRef = useRef<HTMLDivElement>(null);

  // ドメイン名を取得する関数
  const getDomainName = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, "");
    } catch {
      return "";
    }
  };

  // マウスダウンイベントハンドラ
  const handleMouseDown = (e: React.MouseEvent) => {
    // ドロップダウンメニューのボタンがクリックされた場合はドラッグを開始しない
    if ((e.target as HTMLElement).closest("[data-dropdown-trigger]")) {
      return;
    }

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // マウス移動イベントハンドラ
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset]
  );

  // マウスアップイベントハンドラ
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onMove(bookmark.id, position.x, position.y);
      // DBに位置を保存
      api
        .updateBookmark(bookmark.id, {
          position_x: position.x,
          position_y: position.y,
        })
        .catch(console.error);
    }
  }, [isDragging, onMove, bookmark.id, position.x, position.y]);

  // 編集処理
  const handleEditSave = async () => {
    if (!editTitle.trim() || !editUrl.trim()) {
      setError("タイトルとURLは必須です");
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log("ブックマーク更新開始:", bookmark.id); // デバッグ用
      const updatedData = {
        name: editTitle.trim(), // DBではnameフィールド
        url: editUrl.trim(),
        icon: editIcon.trim() || undefined,
      };

      const result = await api.updateBookmark(bookmark.id, updatedData);
      console.log("ブックマーク更新成功:", result); // デバッグ用

      // 親コンポーネントに更新を通知
      if (onUpdate) {
        onUpdate(bookmark.id, {
          title: editTitle.trim(),
          url: editUrl.trim(),
          icon: editIcon.trim() || undefined,
          updated_at: new Date().toISOString(),
        });
      }

      setEditOpen(false);
    } catch (e: unknown) {
      console.error("ブックマーク更新エラー:", e); // デバッグ用
      if (e instanceof Error) {
        setError(`更新に失敗しました: ${e.message}`);
      } else {
        setError("更新に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  // 削除処理
  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("ブックマーク削除開始:", bookmark.id); // デバッグ用
      await api.deleteBookmark(bookmark.id);
      console.log("ブックマーク削除成功:", bookmark.id); // デバッグ用

      // 親コンポーネントに削除を通知
      if (onDelete) {
        onDelete(bookmark.id);
      }

      setDeleteOpen(false);
    } catch (e: unknown) {
      console.error("ブックマーク削除エラー:", e); // デバッグ用
      if (e instanceof Error) {
        setError(`削除に失敗しました: ${e.message}`);
      } else {
        setError("削除に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  // 編集ダイアログを開く
  const handleEdit = () => {
    setEditTitle(bookmark.title);
    setEditUrl(bookmark.url);
    setEditIcon(bookmark.icon || "");
    setError("");
    setEditOpen(true);
  };

  // 削除ダイアログを開く
  const handleDelete = () => {
    setError("");
    setDeleteOpen(true);
  };

  // イベントリスナーの設定と解除
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <>
      <div
        ref={cardRef}
        className={`bookmark-card ${isDragging ? "z-30" : "z-10 hover:z-20"}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={isPublic ? undefined : handleMouseDown}
      >
        <Card
          className={`
            w-48 max-w-sm
            bg-white/95 backdrop-blur-sm border border-gray-200/60
            shadow-lg hover:shadow-xl
            transition-all duration-300 ease-in-out
            ${
              isDragging
                ? "rotate-2 scale-105 shadow-2xl z-30"
                : "hover:scale-[1.02] hover:-translate-y-1 hover:animate-gentle-float"
            }
            ${isPublic ? "" : "cursor-grab active:cursor-grabbing"}
            overflow-hidden rounded-xl
          `}
        >
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {/* アイコン表示 */}
                <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-sm border border-blue-100/50">
                  {bookmark.icon ? (
                    <img
                      src={bookmark.icon}
                      alt="favicon"
                      className="w-4 h-4 rounded-sm object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const iconElement = document.createElement("div");
                          iconElement.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>';
                          parent.appendChild(iconElement);
                        }
                      }}
                    />
                  ) : (
                    <Globe className="w-3 h-3 text-blue-600" />
                  )}
                </div>

                {/* タイトル */}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2 mb-0.5">
                    {bookmark.title}
                  </CardTitle>
                  <p className="text-[10px] text-gray-500 font-medium truncate">
                    {getDomainName(bookmark.url)}
                  </p>
                </div>
              </div>

              {/* メニューボタン */}
              {!isPublic && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-full transition-colors shrink-0"
                      data-dropdown-trigger
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={handleEdit}
                      className="text-xs cursor-pointer"
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive text-xs cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>

          <CardContent className="pb-3 pt-0 px-3">
            {/* URL表示 */}
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md w-full justify-center
                bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100
                border border-blue-100 hover:border-blue-200
                text-[10px] text-blue-700 hover:text-blue-800 font-medium
                transition-all duration-200 ease-in-out
                hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]
                focus:outline-none focus:ring-1 focus:ring-blue-500/20
              "
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-2.5 w-2.5 transition-transform group-hover:scale-110" />
              サイトを開く
            </a>

            {/* URL詳細 */}
            <div className="mt-2 group">
              <p className="text-[9px] text-gray-500 truncate font-mono bg-gray-50/80 hover:bg-gray-100/80 px-1.5 py-1 rounded border border-gray-200/50 transition-all duration-200">
                {bookmark.url}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 編集ダイアログ */}
      {!isPublic && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                ブックマークを編集
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  タイトル
                </Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="ブックマークタイトル"
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-url" className="text-sm font-medium">
                  URL
                </Label>
                <Input
                  id="edit-url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-icon" className="text-sm font-medium">
                  アイコンURL（オプション）
                </Label>
                <Input
                  id="edit-icon"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  disabled={loading}
                  className="mt-1"
                />
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={loading}>
                  キャンセル
                </Button>
              </DialogClose>
              <Button onClick={handleEditSave} disabled={loading}>
                {loading ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 削除確認ダイアログ */}
      {!isPublic && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ブックマークを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                「{bookmark.title}」を削除します。この操作は取り消せません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
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
    </>
  );
}
