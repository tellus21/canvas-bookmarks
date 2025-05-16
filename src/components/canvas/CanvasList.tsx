"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Canvas } from "@/types";

interface CanvasListProps {
  canvases: Canvas[];
}

export function CanvasList({ canvases }: CanvasListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCanvases = canvases.filter((canvas) =>
    canvas.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="キャンバスを検索..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          新規キャンバス
        </Button>
      </div>

      {filteredCanvases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            キャンバスが見つかりませんでした
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCanvases.map((canvas) => (
            <Link href={`/canvas/${canvas.id}`} key={canvas.id}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{canvas.title}</span>
                    {canvas.public && <Badge variant="outline">公開</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">
                    プレビュー
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  最終更新: {new Date(canvas.updated_at).toLocaleDateString()}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
