"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase, api } from "@/lib/supabase";
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
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const filteredCanvases = canvases.filter((canvas) =>
    canvas.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    setError("");
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      console.log("user.id:", user?.id); // デバッグ用
      if (!user || !user.id) {
        setError("ユーザー情報が取得できませんでした");
        setLoading(false);
        return;
      }
      const canvas = await api.addCanvas({
        user_id: user.id,
        title: title.trim(),
      });
      if (!canvas || !canvas.id) {
        setError("キャンバスの作成に失敗しました");
        setLoading(false);
        return;
      }
      setOpen(false);
      setTitle("");
      router.push(`/canvas/${canvas.id}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        // SupabaseエラーはError型かつプロパティを持つ場合がある
        const errObj = e as Error & {
          details?: string;
          hint?: string;
          code?: string;
        };
        setError(
          errObj.message +
            (errObj.details ? `\n詳細: ${errObj.details}` : "") +
            (errObj.hint ? `\nヒント: ${errObj.hint}` : "") +
            (errObj.code ? `\nコード: ${errObj.code}` : "")
        );
      } else if (typeof e === "object" && e !== null) {
        const errObj = e as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };
        setError(
          (errObj.message || "作成に失敗しました") +
            (errObj.details ? `\n詳細: ${errObj.details}` : "") +
            (errObj.hint ? `\nヒント: ${errObj.hint}` : "") +
            (errObj.code ? `\nコード: ${errObj.code}` : "")
        );
      } else {
        setError("作成に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setTitle("新しいキャンバス")}>
              {" "}
              {/* デフォルト値 */}
              <PlusCircle className="mr-2 h-4 w-4" />
              新規キャンバス
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規キャンバス作成</DialogTitle>
            </DialogHeader>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="キャンバスタイトル"
              disabled={loading}
              autoFocus
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? "作成中..." : "作成"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={loading}>
                  キャンセル
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
