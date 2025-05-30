import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Canvas } from "@/types";
import { ShareDialog } from "@/components/canvas/ShareDialog";

// APIをモック
vi.mock("@/lib/supabase", () => ({
  api: {
    updateCanvasPublicStatus: vi.fn(),
  },
}));

// クリップボードAPIをモック
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

describe("ShareDialog", () => {
  const mockCanvas: Canvas = {
    id: "test-canvas-id",
    title: "Test Canvas",
    user_id: "test-user-id",
    public: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dialog when open", () => {
    // Act
    render(
      <ShareDialog
        canvas={mockCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    // Assert
    expect(screen.getByText("キャンバスを共有")).toBeInTheDocument();
    expect(screen.getByText("Test Canvas")).toBeInTheDocument();
  });

  it("should not render dialog when closed", () => {
    // Act
    render(
      <ShareDialog
        canvas={mockCanvas}
        isOpen={false}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    // Assert
    expect(screen.queryByText("キャンバスを共有")).not.toBeInTheDocument();
  });

  it("should show private status when canvas is not public", () => {
    // Act
    render(
      <ShareDialog
        canvas={mockCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    // Assert
    expect(screen.getByText("プライベート")).toBeInTheDocument();
    expect(screen.getByText("公開にする")).toBeInTheDocument();
  });

  it("should show public status when canvas is public", () => {
    // Arrange
    const publicCanvas = { ...mockCanvas, public: true };

    // Act
    render(
      <ShareDialog
        canvas={publicCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    // Assert
    expect(screen.getByText("公開中")).toBeInTheDocument();
    expect(screen.getByText("プライベートにする")).toBeInTheDocument();
  });

  it("should show share URL when canvas is public", () => {
    // Arrange
    const publicCanvas = { ...mockCanvas, public: true };

    // Act
    render(
      <ShareDialog
        canvas={publicCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    // Assert
    const shareUrl = `${window.location.origin}/share/${publicCanvas.id}`;
    expect(screen.getByDisplayValue(shareUrl)).toBeInTheDocument();
    expect(screen.getByText("URLをコピー")).toBeInTheDocument();
  });

  it("should copy URL to clipboard when copy button is clicked", async () => {
    // Arrange
    const publicCanvas = { ...mockCanvas, public: true };
    const expectedUrl = `${window.location.origin}/share/${publicCanvas.id}`;

    // Act
    render(
      <ShareDialog
        canvas={publicCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    const copyButton = screen.getByText("URLをコピー");
    fireEvent.click(copyButton);

    // Assert
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedUrl);
    });
  });

  it("should call updateCanvasPublicStatus and onUpdate when toggling to public", async () => {
    // Arrange
    const { api } = await import("@/lib/supabase");
    const updatedCanvas = { ...mockCanvas, public: true };
    vi.mocked(api.updateCanvasPublicStatus).mockResolvedValue(updatedCanvas);

    // Act
    render(
      <ShareDialog
        canvas={mockCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    const toggleButton = screen.getByText("公開にする");
    fireEvent.click(toggleButton);

    // Assert
    await waitFor(() => {
      expect(api.updateCanvasPublicStatus).toHaveBeenCalledWith(
        mockCanvas.id,
        true
      );
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedCanvas);
    });
  });

  it("should call updateCanvasPublicStatus and onUpdate when toggling to private", async () => {
    // Arrange
    const publicCanvas = { ...mockCanvas, public: true };
    const { api } = await import("@/lib/supabase");
    const updatedCanvas = { ...mockCanvas, public: false };
    vi.mocked(api.updateCanvasPublicStatus).mockResolvedValue(updatedCanvas);

    // Act
    render(
      <ShareDialog
        canvas={publicCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    const toggleButton = screen.getByText("プライベートにする");
    fireEvent.click(toggleButton);

    // Assert
    await waitFor(() => {
      expect(api.updateCanvasPublicStatus).toHaveBeenCalledWith(
        publicCanvas.id,
        false
      );
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedCanvas);
    });
  });

  it("should show loading state when toggling public status", async () => {
    // Arrange
    const { api } = await import("@/lib/supabase");
    vi.mocked(api.updateCanvasPublicStatus).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    // Act
    render(
      <ShareDialog
        canvas={mockCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    const toggleButton = screen.getByText("公開にする");
    fireEvent.click(toggleButton);

    // Assert
    expect(screen.getByText("更新中...")).toBeInTheDocument();
  });

  it("should handle error when updating public status", async () => {
    // Arrange
    const { api } = await import("@/lib/supabase");
    vi.mocked(api.updateCanvasPublicStatus).mockRejectedValue(
      new Error("Update failed")
    );

    // Act
    render(
      <ShareDialog
        canvas={mockCanvas}
        isOpen={true}
        onClose={() => {}}
        onUpdate={mockOnUpdate}
      />
    );

    const toggleButton = screen.getByText("公開にする");
    fireEvent.click(toggleButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });
  });
});
