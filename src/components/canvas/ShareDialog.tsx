"use client";

import { useState } from "react";
import { Share2, Copy, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Canvas } from "@/types";
import { api } from "@/lib/supabase";

interface ShareDialogProps {
  canvas: Canvas;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (canvas: Canvas) => void;
}

export function ShareDialog({
  canvas,
  isOpen,
  onClose,
  onUpdate,
}: ShareDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  const shareUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/share/${canvas.id}`;

  const handleTogglePublic = async () => {
    setIsLoading(true);
    setError("");

    try {
      const updatedCanvas = await api.updateCanvasPublicStatus(
        canvas.id,
        !canvas.public
      );
      const compatibleCanvas: Canvas = {
        ...updatedCanvas,
        updated_at: updatedCanvas.updated_at || updatedCanvas.created_at,
      };
      onUpdate(compatibleCanvas);
    } catch (err) {
      setError("エラーが発生しました");
      console.error("公開状態の更新に失敗:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("URLのコピーに失敗:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            キャンバスを共有
          </DialogTitle>
          <DialogDescription>{canvas.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 公開状態の表示と切り替え */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {canvas.public ? (
                <>
                  <Globe className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">公開中</p>
                    <p className="text-sm text-gray-600">
                      誰でもこのキャンバスを閲覧できます
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">プライベート</p>
                    <p className="text-sm text-gray-600">
                      あなただけがアクセスできます
                    </p>
                  </div>
                </>
              )}
            </div>

            <Button
              variant={canvas.public ? "outline" : "default"}
              onClick={handleTogglePublic}
              disabled={isLoading}
            >
              {isLoading
                ? "更新中..."
                : canvas.public
                ? "プライベートにする"
                : "公開にする"}
            </Button>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          {/* 共有URL（公開時のみ表示） */}
          {canvas.public && (
            <div className="space-y-2">
              <label className="text-sm font-medium">共有URL</label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="px-3"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copySuccess ? "コピー完了!" : "URLをコピー"}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                このURLを共有することで、誰でもキャンバスを閲覧できます
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
