// import { createClient } from '@supabase/supabase-js';

// 実際の環境では.envファイルから読み込む
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// テスト用のユーザーデータ
export const MOCK_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  name: 'Test User',
  created_at: new Date().toISOString()
};

// テスト用のキャンバスデータ
export const MOCK_CANVASES = [
  {
    id: 'b3daa77b-5c1a-4a37-9c1a-aaf010101010',
    title: 'プロジェクトA資料',
    user_id: MOCK_USER.id,
    public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c3daa77b-5c1a-4a37-9c1a-aaf010101011',
    title: '技術記事ブックマーク',
    user_id: MOCK_USER.id,
    public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'd3daa77b-5c1a-4a37-9c1a-aaf010101012',
    title: '参考デザイン集',
    user_id: MOCK_USER.id,
    public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// テスト用のブックマークデータ
export const MOCK_BOOKMARKS = [
  {
    id: 'e3daa77b-5c1a-4a37-9c1a-aaf010101013',
    canvas_id: 'b3daa77b-5c1a-4a37-9c1a-aaf010101010',
    title: 'プロジェクト計画書',
    url: 'https://example.com/project-plan',
    icon: 'file-text',
    position_x: 100,
    position_y: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'f3daa77b-5c1a-4a37-9c1a-aaf010101014',
    canvas_id: 'b3daa77b-5c1a-4a37-9c1a-aaf010101010',
    title: 'API仕様書',
    url: 'https://example.com/api-spec',
    icon: 'code',
    position_x: 300,
    position_y: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'g3daa77b-5c1a-4a37-9c1a-aaf010101015',
    canvas_id: 'b3daa77b-5c1a-4a37-9c1a-aaf010101010',
    title: 'デザインガイドライン',
    url: 'https://example.com/design-guide',
    icon: 'palette',
    position_x: 500,
    position_y: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// テスト用のグループデータ
export const MOCK_GROUPS = [
  {
    id: 'h3daa77b-5c1a-4a37-9c1a-aaf010101016',
    canvas_id: 'b3daa77b-5c1a-4a37-9c1a-aaf010101010',
    title: '開発ドキュメント',
    position_x: 50,
    position_y: 100,
    width: 400,
    height: 300,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    bookmarks: [
      MOCK_BOOKMARKS[0],
      MOCK_BOOKMARKS[1]
    ]
  }
];

// APIのモック実装
export const api = {
  getCanvases: async () => {
    return MOCK_CANVASES;
  },
  getCanvas: async (id: string) => {
    return MOCK_CANVASES.find(canvas => canvas.id === id);
  },
  getBookmarks: async (canvasId: string) => {
    return MOCK_BOOKMARKS.filter(bookmark => bookmark.canvas_id === canvasId);
  },
  getGroups: async (canvasId: string) => {
    return MOCK_GROUPS.filter(group => group.canvas_id === canvasId);
  }
}; 