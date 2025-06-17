"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Group } from "@/types";
import { api } from "@/lib/supabase";

interface GroupContainerProps {
  group: Group;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (group: Group) => void;
  isPublic?: boolean;
}

export function GroupContainer({
  group,
  onMove,
  onResize,
  onDelete,
  onEdit,
  isPublic = false,
}: GroupContainerProps) {
  const [position, setPosition] = useState({
    x: group.position_x,
    y: group.position_y,
  });
  const [size, setSize] = useState({
    width: group.width,
    height: group.height,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    // 公開ページまたはメニューボタンがクリックされた場合はドラッグしない
    if (isPublic || e.target !== e.currentTarget) return;

    if (containerRef.current && !isResizing) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // マウス移動
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPosition({ x: newX, y: newY });
      } else if (isResizing) {
        const newWidth = Math.max(200, e.clientX - position.x);
        const newHeight = Math.max(100, e.clientY - position.y);
        setSize({ width: newWidth, height: newHeight });
      }
    },
    [isDragging, isResizing, dragOffset, position.x, position.y]
  );

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onMove(group.id, position.x, position.y);
      // DBに位置を保存
      api
        .updateGroup(group.id, {
          position_x: position.x,
          position_y: position.y,
        })
        .catch(console.error);
    } else if (isResizing) {
      setIsResizing(false);
      onResize(group.id, size.width, size.height);
      // DBにサイズを保存
      api
        .updateGroup(group.id, { width: size.width, height: size.height })
        .catch(console.error);
    }
  }, [
    isDragging,
    isResizing,
    onMove,
    onResize,
    group.id,
    position.x,
    position.y,
    size.width,
    size.height,
  ]);

  // リサイズ開始
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isPublic) return;
    e.stopPropagation();
    setIsResizing(true);
  };

  // 削除処理
  const handleDelete = () => {
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await onDelete(group.id);
      setDeleteOpen(false);
    } catch (error) {
      console.error("グループ削除エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // イベントリスナーの設定と解除
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, handleMouseMove, handleMouseUp]);

  return (
    <>
      <div
        ref={containerRef}
        className="group-container"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between p-2">
          <div className="font-medium">{group.title}</div>
          {!isPublic && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(group)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {!isPublic && (
          <div
            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          >
            <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-400"></div>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>グループを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{group.title}」を削除します。この操作は取り消せません。
              グループ内のすべてのブックマークも削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
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
