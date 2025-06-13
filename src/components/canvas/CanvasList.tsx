"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Globe,
  Rocket,
} from "lucide-react";
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

export function CanvasList({ canvases: initialCanvases }: CanvasListProps) {
  const [canvases, setCanvases] = useState(initialCanvases);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editingCanvas, setEditingCanvas] = useState<Canvas | null>(null);
  const [deletingCanvas, setDeletingCanvas] = useState<Canvas | null>(null);
  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
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

      // ユニークなタイトルを生成
      const uniqueTitle = await api.generateUniqueCanvasTitle(
        user.id,
        title.trim()
      );

      const canvas = await api.addCanvas({
        user_id: user.id,
        title: uniqueTitle,
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

  // 編集ダイアログを開く
  const handleEdit = (canvas: Canvas) => {
    setEditingCanvas(canvas);
    setEditTitle(canvas.title);
    setError("");
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingCanvas) return;
    setError("");
    if (!editTitle.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || !user.id) {
        setError("ユーザー情報が取得できませんでした");
        setLoading(false);
        return;
      }

      // 現在のタイトルと同じ場合は重複チェックをスキップ
      let finalTitle = editTitle.trim();
      if (editTitle.trim() !== editingCanvas.title) {
        // タイトルが変更された場合のみ重複チェック（現在のキャンバスは除外）
        finalTitle = await api.generateUniqueCanvasTitle(
          user.id,
          editTitle.trim(),
          editingCanvas.id
        );
      }

      const updatedCanvas = await api.updateCanvas(editingCanvas.id, {
        title: finalTitle,
      });
      if (updatedCanvas) {
        setCanvases((prev) =>
          prev.map((canvas) =>
            canvas.id === editingCanvas.id
              ? {
                  ...canvas,
                  title: finalTitle,
                  updated_at: new Date().toISOString(),
                }
              : canvas
          )
        );
      }
      setEditOpen(false);
      setEditingCanvas(null);
      setEditTitle("");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("更新に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (canvas: Canvas) => {
    setDeletingCanvas(canvas);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCanvas) return;
    setLoading(true);
    setError(""); // エラーをクリア
    try {
      console.log("削除開始:", deletingCanvas.id); // デバッグ用
      await api.deleteCanvas(deletingCanvas.id);
      console.log("削除成功:", deletingCanvas.id); // デバッグ用
      setCanvases((prev) =>
        prev.filter((canvas) => canvas.id !== deletingCanvas.id)
      );
      setDeleteOpen(false);
      setDeletingCanvas(null);
    } catch (e: unknown) {
      console.error("削除エラー:", e); // デバッグ用
      if (e instanceof Error) {
        console.error("エラーメッセージ:", e.message); // デバッグ用
        setError(`削除に失敗しました: ${e.message}`);
      } else {
        console.error("不明なエラー:", e); // デバッグ用
        setError("削除に失敗しました");
      }
      // エラーが発生した場合はダイアログを閉じない
    } finally {
      setLoading(false);
    }
  };

  // サンプルキャンバス作成
  const handleCreateSample = async () => {
    setSampleLoading(true);
    setError("");
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || !user.id) {
        setError("ユーザー情報が取得できませんでした");
        return;
      }

      const canvas = await api.createSampleWebDevCanvas(user.id);
      if (canvas) {
        setCanvases((prev) => [canvas, ...prev]);
        // 作成されたキャンバスに遷移
        router.push(`/canvas/${canvas.id}`);
      }
    } catch (e: unknown) {
      console.error("サンプルキャンバス作成エラー:", e);
      if (e instanceof Error) {
        setError(`サンプルキャンバスの作成に失敗しました: ${e.message}`);
      } else {
        setError("サンプルキャンバスの作成に失敗しました");
      }
    } finally {
      setSampleLoading(false);
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
        <div className="flex gap-2">
          {/* サンプルキャンバス作成ボタン */}
          <Button
            variant="outline"
            onClick={handleCreateSample}
            disabled={sampleLoading}
            className="hidden sm:flex"
          >
            <Rocket className="mr-2 h-4 w-4" />
            {sampleLoading ? "作成中..." : "サンプルを作成"}
          </Button>

          {/* 通常のキャンバス作成ボタン */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setTitle("新しいキャンバス")}>
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
      </div>

      {/* 空状態でのサンプル案内 */}
      {filteredCanvases.length === 0 && searchTerm === "" && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <Rocket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              キャンバスがありません
            </h3>
            <p className="text-gray-500 mb-6">
              初めての方はサンプルキャンバスを作成して、
              <br />
              アプリの使い方を確認してみましょう！
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleCreateSample} disabled={sampleLoading}>
                <Rocket className="mr-2 h-4 w-4" />
                {sampleLoading ? "作成中..." : "Webアプリ開発サンプルを作成"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                空のキャンバスを作成
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* キャンバス一覧 */}
      {filteredCanvases.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCanvases.map((canvas) => (
            <Card key={canvas.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold truncate">
                  {canvas.title}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(canvas)}>
                      <Edit className="mr-2 h-4 w-4" />
                      編集
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(canvas)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  作成日:{" "}
                  {new Date(canvas.created_at).toLocaleDateString("ja-JP")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-2">
                  {canvas.public && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      公開
                    </Badge>
                  )}
                </div>
                <Button asChild>
                  <Link href={`/canvas/${canvas.id}`}>開く</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 検索結果なし */}
      {filteredCanvases.length === 0 && searchTerm !== "" && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            「{searchTerm}」に一致するキャンバスが見つかりませんでした。
          </p>
        </div>
      )}

      {/* 編集ダイアログ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>キャンバス編集</DialogTitle>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="キャンバスタイトル"
            disabled={loading}
            autoFocus
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
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
            <AlertDialogTitle>キャンバスを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deletingCanvas?.title}
              」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <div className="text-red-500 text-sm">{error}</div>}
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
    </div>
  );
}
