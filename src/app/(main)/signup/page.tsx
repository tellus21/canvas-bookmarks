"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/canvas");
    }
  };

  // Googleログイン機能 - 一時的に無効化
  // const handleGoogleSignUp = async () => {
  //   setLoading(true);
  //   setError("");
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //   });
  //   setLoading(false);
  //   if (error) setError(error.message);
  // };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSignUp}
        className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">新規登録</h1>
        <div className="space-y-2">
          <label className="block text-sm font-medium">表示名</label>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="nickname"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">メールアドレス</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">パスワード</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "登録中..." : "新規登録"}
        </Button>
        {/* Googleログインボタン - 一時的に非表示 */}
        {/* <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          Googleで登録
        </Button> */}
        <div className="text-center text-sm mt-4">
          すでにアカウントをお持ちの方は{" "}
          <a href="/signin" className="text-primary underline">
            ログイン
          </a>
        </div>
      </form>
    </div>
  );
}
