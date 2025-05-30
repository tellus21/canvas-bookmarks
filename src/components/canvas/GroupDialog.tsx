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
import { api, BookmarkGroup } from "@/lib/supabase";

interface GroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (group: BookmarkGroup) => void;
  canvasId: string;
  group?: BookmarkGroup | null; // 編集の場合
}

export function GroupDialog({
  isOpen,
  onClose,
  onSuccess,
  canvasId,
  group = null,
}: GroupDialogProps) {
  const [name, setName] = useState("");
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!group;

  useEffect(() => {
    if (isOpen) {
      // 編集の場合は既存の値をセット
      if (isEditing && group) {
        setName(group.name);
        setPositionX(group.position_x || 0);
        setPositionY(group.position_y || 0);
        setWidth(group.width || 300);
        setHeight(group.height || 200);
      } else {
        // 新規作成の場合は初期化
        setName("");
        setPositionX(0);
        setPositionY(0);
        setWidth(300);
        setHeight(200);
      }
      setError("");
    }
  }, [isOpen, isEditing, group]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("グループ名を入力してください");
      return;
    }

    setLoading(true);
    try {
      let result: BookmarkGroup;

      if (isEditing && group) {
        // 編集の場合
        result = await api.updateGroup(group.id, {
          name: name.trim(),
          position_x: positionX,
          position_y: positionY,
          width,
          height,
        });
      } else {
        // 新規作成の場合
        result = await api.addGroup({
          canvas_id: canvasId,
          name: name.trim(),
          position_x: positionX,
          position_y: positionY,
          width,
          height,
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
            {isEditing ? "グループを編集" : "新しいグループ"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "グループの情報を編集してください。"
              : "新しいグループを作成します。必要な情報を入力してください。"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">グループ名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="グループ名を入力"
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positionX">X座標</Label>
              <Input
                id="positionX"
                type="number"
                value={positionX}
                onChange={(e) => setPositionX(Number(e.target.value))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="positionY">Y座標</Label>
              <Input
                id="positionY"
                type="number"
                value={positionY}
                onChange={(e) => setPositionY(Number(e.target.value))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">幅</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="100"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">高さ</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="100"
                disabled={loading}
                required
              />
            </div>
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
            <Button type="submit" disabled={loading}>
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
