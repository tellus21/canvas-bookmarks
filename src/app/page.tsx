import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    ブックマークを視覚的に整理
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    CanvasBookmarksは、ブックマークをカードのように配置して、視覚的に整理できるツールです。
                    プロジェクトごとに知識をまとめたり、共有したりすることが簡単にできます。
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/canvas">今すぐ始める</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last">
                <div className="h-full bg-muted w-full flex items-center justify-center text-muted-foreground">
                  <span className="text-lg">CanvasBookmarks</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-2 py-4 md:h-14 md:flex-row md:items-center md:justify-between md:py-0">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; 2025 CanvasBookmarks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
