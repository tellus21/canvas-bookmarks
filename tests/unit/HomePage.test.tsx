import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "@/app/page";

// Next.jsのコンポーネントをモック
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("Home Page", () => {
  it("メインタイトルが表示される", () => {
    render(<Home />);

    expect(screen.getByText("ブックマークを視覚的に整理")).toBeInTheDocument();
  });

  it("説明文が表示される", () => {
    render(<Home />);

    expect(
      screen.getByText(
        /CanvasBookmarksは、ブックマークをカードのように配置して/
      )
    ).toBeInTheDocument();
  });

  it("「今すぐ始める」ボタンが表示される", () => {
    render(<Home />);

    const startButton = screen.getByText("今すぐ始める");
    expect(startButton).toBeInTheDocument();
    expect(startButton.closest("a")).toHaveAttribute("href", "/canvas");
  });

  it("フッターが表示される", () => {
    render(<Home />);

    expect(screen.getByText(/© 2025 CanvasBookmarks/)).toBeInTheDocument();
  });
});
