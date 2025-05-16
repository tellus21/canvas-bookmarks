"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark } from "@/types";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onMove: (id: string, x: number, y: number) => void;
}

export function BookmarkCard({ bookmark, onMove }: BookmarkCardProps) {
  const [position, setPosition] = useState({
    x: bookmark.position_x,
    y: bookmark.position_y,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // マウスダウンイベントハンドラ
  const handleMouseDown = (e: React.MouseEvent) => {
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
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    setPosition({ x: newX, y: newY });
  };

  // マウスアップイベントハンドラ
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onMove(bookmark.id, position.x, position.y);
    }
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
  }, [isDragging, dragOffset]);

  return (
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
          <CardTitle className="text-base">{bookmark.title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {bookmark.url}
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
