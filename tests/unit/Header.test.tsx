import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "@/components/Header";

// Next.jsのテーマプロバイダーをモック
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("Header", () => {
  it("ヘッダーが正しくレンダリングされる", () => {
    render(<Header />);

    // ロゴまたはタイトルが表示されているかチェック
    expect(screen.getByText("CanvasBookmarks")).toBeInTheDocument();
  });

  it("ナビゲーションリンクが表示される", () => {
    render(<Header />);

    // 主要なナビゲーション要素が存在するかチェック
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });
});
