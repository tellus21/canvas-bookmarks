import { describe, it, expect, vi, beforeEach } from 'vitest';

// Supabaseクライアントをモック
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  },
  api: {
    getCanvas: vi.fn(),
    updateCanvasPublicStatus: vi.fn(),
    getPublicCanvas: vi.fn()
  }
}));

import { api } from '@/lib/supabase';

describe('Canvas Sharing API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateCanvasPublicStatus', () => {
    it('should return updated canvas when public status is changed to true', async () => {
      // Arrange
      const canvasId = 'test-canvas-id';
      const isPublic = true;
      const expectedResult = {
        id: canvasId,
        title: 'Test Canvas',
        user_id: 'test-user-id',
        public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      vi.mocked(api.updateCanvasPublicStatus).mockResolvedValue(expectedResult);

      // Act
      const result = await api.updateCanvasPublicStatus(canvasId, isPublic);

      // Assert
      expect(api.updateCanvasPublicStatus).toHaveBeenCalledWith(canvasId, true);
      expect(result).toEqual(expectedResult);
      expect(result.public).toBe(true);
    });

    it('should return updated canvas when public status is changed to false', async () => {
      // Arrange
      const canvasId = 'test-canvas-id';
      const isPublic = false;
      const expectedResult = {
        id: canvasId,
        title: 'Test Canvas',
        user_id: 'test-user-id',
        public: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      vi.mocked(api.updateCanvasPublicStatus).mockResolvedValue(expectedResult);

      // Act
      const result = await api.updateCanvasPublicStatus(canvasId, isPublic);

      // Assert
      expect(api.updateCanvasPublicStatus).toHaveBeenCalledWith(canvasId, false);
      expect(result).toEqual(expectedResult);
      expect(result.public).toBe(false);
    });

    it('should throw error when canvas not found', async () => {
      // Arrange
      const canvasId = 'non-existent-canvas-id';
      const isPublic = true;

      vi.mocked(api.updateCanvasPublicStatus).mockRejectedValue(
        new Error('Canvas not found')
      );

      // Act & Assert
      await expect(api.updateCanvasPublicStatus(canvasId, isPublic))
        .rejects.toThrow('Canvas not found');
    });

    it('should throw error when user is not authenticated', async () => {
      // Arrange
      const canvasId = 'test-canvas-id';
      const isPublic = true;

      vi.mocked(api.updateCanvasPublicStatus).mockRejectedValue(
        new Error('User not authenticated')
      );

      // Act & Assert
      await expect(api.updateCanvasPublicStatus(canvasId, isPublic))
        .rejects.toThrow('User not authenticated');
    });

    it('should throw error when user is not the owner', async () => {
      // Arrange
      const canvasId = 'test-canvas-id';
      const isPublic = true;

      vi.mocked(api.updateCanvasPublicStatus).mockRejectedValue(
        new Error('Unauthorized: You can only modify your own canvases')
      );

      // Act & Assert
      await expect(api.updateCanvasPublicStatus(canvasId, isPublic))
        .rejects.toThrow('Unauthorized: You can only modify your own canvases');
    });
  });

  describe('getPublicCanvas', () => {
    it('should return public canvas when canvas is publicly shared', async () => {
      // Arrange
      const canvasId = 'public-canvas-id';
      const expectedCanvas = {
        id: canvasId,
        title: 'Public Test Canvas',
        user_id: 'other-user-id',
        public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      vi.mocked(api.getPublicCanvas).mockResolvedValue(expectedCanvas);

      // Act
      const result = await api.getPublicCanvas(canvasId);

      // Assert
      expect(api.getPublicCanvas).toHaveBeenCalledWith(canvasId);
      expect(result).toEqual(expectedCanvas);
      expect(result.public).toBe(true);
    });

    it('should return null when canvas is not public', async () => {
      // Arrange
      const canvasId = 'private-canvas-id';

      vi.mocked(api.getPublicCanvas).mockResolvedValue(null);

      // Act
      const result = await api.getPublicCanvas(canvasId);

      // Assert
      expect(api.getPublicCanvas).toHaveBeenCalledWith(canvasId);
      expect(result).toBeNull();
    });

    it('should return null when canvas does not exist', async () => {
      // Arrange
      const canvasId = 'non-existent-canvas-id';

      vi.mocked(api.getPublicCanvas).mockResolvedValue(null);

      // Act
      const result = await api.getPublicCanvas(canvasId);

      // Assert
      expect(api.getPublicCanvas).toHaveBeenCalledWith(canvasId);
      expect(result).toBeNull();
    });

    it('should work without authentication (for anonymous users)', async () => {
      // Arrange
      const canvasId = 'public-canvas-id';
      const expectedCanvas = {
        id: canvasId,
        title: 'Public Test Canvas',
        user_id: 'other-user-id',
        public: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      vi.mocked(api.getPublicCanvas).mockResolvedValue(expectedCanvas);

      // Act - 認証無しでも実行可能であることを確認
      const result = await api.getPublicCanvas(canvasId);

      // Assert
      expect(result).toEqual(expectedCanvas);
      expect(result.public).toBe(true);
    });
  });
}); 