"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, Bookmark, BookmarkGroup } from "@/lib/supabase";

interface BookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookmark: Bookmark) => void;
  canvasId: string;
  bookmark?: Bookmark | null; // 編集の場合
}

export function BookmarkDialog({
  isOpen,
  onClose,
  onSuccess,
  canvasId,
  bookmark = null,
}: BookmarkDialogProps) {
  const [groups, setGroups] = useState<BookmarkGroup[]>([]);
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!bookmark;

  useEffect(() => {
    if (isOpen) {
      // ダイアログが開いたときにグループを取得
      api.getGroups(canvasId).then((data) => {
        setGroups(data);
        if (!isEditing && data.length > 0) {
          setGroupId(data[0].id);
        } else if (data.length === 0) {
          setError("グループが存在しません。先にグループを作成してください。");
        }
      });

      // 編集の場合は既存の値をセット
      if (isEditing && bookmark) {
        setGroupId(bookmark.group_id);
        setTitle(bookmark.name);
        setUrl(bookmark.url);
        setIcon(bookmark.icon || "");
      } else {
        // 新規作成の場合は初期化
        setGroupId("");
        setTitle("");
        setUrl("");
        setIcon("");
      }
      if (!isEditing) {
        setError("");
      }
    }
  }, [isOpen, canvasId, isEditing, bookmark]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (groups.length === 0) {
      setError("グループが存在しません。先にグループを作成してください。");
      return;
    }

    if (!groupId || !title.trim() || !url.trim()) {
      setError("全ての必須項目を入力してください");
      return;
    }

    setLoading(true);
    try {
      let result: Bookmark;

      if (isEditing && bookmark) {
        // 編集の場合
        result = await api.updateBookmark(bookmark.id, {
          name: title.trim(),
          url: url.trim(),
          icon: icon.trim() || "",
        });
      } else {
        // 新規作成の場合
        result = await api.addBookmark({
          group_id: groupId,
          name: title.trim(),
          url: url.trim(),
          icon: icon.trim() || "",
        });
      }

      onSuccess(result);
      onClose();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else if (typeof e === "object" && e !== null && "message" in e) {
        setError((e as { message?: string }).message || "処理に失敗しました");
      } else {
        setError("処理に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "ブックマークを編集" : "新しいブックマーク"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "ブックマークの情報を編集してください。"
              : "新しいブックマークを作成します。必要な情報を入力してください。"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group">グループ *</Label>
            <select
              id="group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={loading || groups.length === 0}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">
                {groups.length === 0
                  ? "利用可能なグループがありません"
                  : "グループを選択してください"}
              </option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ブックマークのタイトルを入力"
              disabled={loading || groups.length === 0}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading || groups.length === 0}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">アイコンURL（任意）</Label>
            <Input
              id="icon"
              type="url"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://example.com/icon.png"
              disabled={loading || groups.length === 0}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded border">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading || groups.length === 0}>
              {loading
                ? isEditing
                  ? "更新中..."
                  : "作成中..."
                : isEditing
                ? "更新"
                : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
