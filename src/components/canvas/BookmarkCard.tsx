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
import { MoreVertical, Edit, Trash2, ExternalLink } from "lucide-react";
import { Bookmark } from "@/types";
import { api } from "@/lib/supabase";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onMove: (id: string, x: number, y: number) => void;
  onUpdate?: (id: string, updatedBookmark: Partial<Bookmark>) => void;
  onDelete?: (id: string) => void;
}

export function BookmarkCard({
  bookmark,
  onMove,
  onUpdate,
  onDelete,
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
        className="bookmark-card"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <Card className="w-full">
          <CardHeader className="pb-2 pt-4 cursor-grab">
            <CardTitle className="text-base flex justify-between items-start">
              <span className="flex-1">{bookmark.title}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    data-dropdown-trigger
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-3 w-3" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              {bookmark.url}
            </a>
            {bookmark.icon && (
              <div className="mt-2">
                <img
                  src={bookmark.icon}
                  alt="アイコン"
                  className="w-4 h-4 inline-block"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ブックマークを編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">タイトル</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="ブックマークタイトル"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="edit-icon">アイコンURL（オプション）</Label>
              <Input
                id="edit-icon"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                placeholder="https://example.com/icon.png"
                disabled={loading}
              />
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded border">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditSave} disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={loading}>
                キャンセル
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ブックマークを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{bookmark.title}」を削除します。この操作は取り消せません。
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
    </>
  );
}
