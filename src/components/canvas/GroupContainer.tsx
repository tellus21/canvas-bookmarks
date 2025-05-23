"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Group } from "@/types";
import { api } from "@/lib/supabase";

interface GroupContainerProps {
  group: Group;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
}

export function GroupContainer({
  group,
  onMove,
  onResize,
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
  const containerRef = useRef<HTMLDivElement>(null);

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
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
    e.stopPropagation();
    setIsResizing(true);
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
      <div className="p-2 font-medium">{group.title}</div>
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-400"></div>
      </div>
    </div>
  );
}
