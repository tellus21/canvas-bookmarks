import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義
export type Canvas = {
  id: string;
  user_id: string;
  title: string;
  public: boolean;
  created_at: string;
  updated_at?: string;
};

export type BookmarkGroup = {
  id: string;
  canvas_id: string;
  name: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  created_at?: string;
  updated_at?: string;
};

export type Bookmark = {
  id: string;
  group_id: string;
  name: string;
  url: string;
  icon: string;
  position_x?: number;
  position_y?: number;
  created_at?: string;
  updated_at?: string;
};

export type User = {
  id: string;
  display_name: string;
  email: string;
};

export const api = {
  // 全てのキャンバス取得
  getCanvases: async (user_id?: string): Promise<Canvas[]> => {
    let query = supabase
      .from('canvas')
      .select('id, user_id, title, is_public, created_at')
      .order('created_at', { ascending: false });
    
    // user_idが指定された場合はフィルタリング
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      public: item.is_public,
      is_public: undefined
    }));
  },

  // キャンバス1件取得
  getCanvas: async (id: string): Promise<Canvas | null> => {
    const { data, error } = await supabase
      .from('canvas')
      .select('id, user_id, title, is_public, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      ...data,
      public: data.is_public,
    };
  },

  // グループ一覧取得
  getGroups: async (canvasId: string): Promise<BookmarkGroup[]> => {
    const { data, error } = await supabase
      .from('bookmark_group')
      .select('id, canvas_id, name, position_x, position_y, width, height, created_at, updated_at')
      .eq('canvas_id', canvasId);
    if (error) throw error;
    return data || [];
  },

  // グループ内のブックマーク一覧取得
  getBookmarks: async (groupId: string): Promise<Bookmark[]> => {
    const { data, error } = await supabase
      .from('bookmark')
      .select('id, group_id, name, url, icon, position_x, position_y, created_at, updated_at')
      .eq('group_id', groupId);
    if (error) throw error;
    return data || [];
  },

  // ユーザー情報取得
  getUser: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // キャンバス追加
  addCanvas: async (params: {
    user_id: string;
    title: string;
    public?: boolean;
  }) => {
    const { data, error } = await supabase
      .from('canvas')
      .insert([
        {
          user_id: params.user_id,
          title: params.title,
          is_public: params.public ?? false,
        },
      ])
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      ...data,
      public: data.is_public,
    };
  },

  // キャンバス編集
  updateCanvas: async (id: string, params: {
    title?: string;
    public?: boolean;
  }) => {
    const updateData: { title?: string; is_public?: boolean } = {};
    if (params.title !== undefined) updateData.title = params.title;
    if (params.public !== undefined) updateData.is_public = params.public;

    const { data, error } = await supabase
      .from('canvas')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      ...data,
      public: data.is_public,
    };
  },

  // キャンバス削除（カスケード削除）
  deleteCanvas: async (id: string) => {
    console.log("Supabase deleteCanvas 開始:", id); // デバッグ用
    
    try {
      // 1. キャンバス内のすべてのグループを取得
      const groups = await api.getGroups(id);
      console.log("削除対象グループ:", groups.length); // デバッグ用
      
      // 2. 各グループ内のブックマークを削除
      for (const group of groups) {
        const bookmarks = await api.getBookmarks(group.id);
        console.log(`グループ ${group.id} のブックマーク削除:`, bookmarks.length); // デバッグ用
        
        for (const bookmark of bookmarks) {
          const { error: bookmarkError } = await supabase
            .from('bookmark')
            .delete()
            .eq('id', bookmark.id);
          
          if (bookmarkError) {
            console.error("ブックマーク削除エラー:", bookmarkError);
            throw bookmarkError;
          }
        }
      }
      
      // 3. すべてのグループを削除
      for (const group of groups) {
        const { error: groupError } = await supabase
          .from('bookmark_group')
          .delete()
          .eq('id', group.id);
        
        if (groupError) {
          console.error("グループ削除エラー:", groupError);
          throw groupError;
        }
      }
      
      // 4. 最後にキャンバスを削除
      const { error } = await supabase
        .from('canvas')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Supabase deleteCanvas エラー:", error); // デバッグ用
        console.error("エラー詳細:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }); // デバッグ用
        throw error;
      }
      
      console.log("Supabase deleteCanvas 成功:", id); // デバッグ用
      return true;
    } catch (error) {
      console.error("カスケード削除エラー:", error);
      throw error;
    }
  },

  // グループ追加
  addGroup: async (params: {
    canvas_id: string;
    name: string;
    position_x?: number;
    position_y?: number;
    width?: number;
    height?: number;
  }) => {
    const { data, error } = await supabase
      .from('bookmark_group')
      .insert([
        {
          canvas_id: params.canvas_id,
          name: params.name,
          position_x: params.position_x ?? 0,
          position_y: params.position_y ?? 0,
          width: params.width ?? 300,
          height: params.height ?? 200,
        },
      ])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // グループ編集
  updateGroup: async (id: string, params: {
    name?: string;
    position_x?: number;
    position_y?: number;
    width?: number;
    height?: number;
  }) => {
    const { data, error } = await supabase
      .from('bookmark_group')
      .update(params)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // グループ削除（カスケード削除）
  deleteGroup: async (id: string) => {
    try {
      console.log("Supabase deleteGroup 開始:", id); // デバッグ用
      
      // 1. グループ内のすべてのブックマークを取得
      const bookmarks = await api.getBookmarks(id);
      console.log("削除対象ブックマーク:", bookmarks.length); // デバッグ用
      
      // 2. 各ブックマークを削除
      for (const bookmark of bookmarks) {
        const { error: bookmarkError } = await supabase
          .from('bookmark')
          .delete()
          .eq('id', bookmark.id);
        
        if (bookmarkError) {
          console.error("ブックマーク削除エラー:", bookmarkError);
          throw bookmarkError;
        }
      }
      
      // 3. グループを削除
      const { error } = await supabase
        .from('bookmark_group')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Supabase deleteGroup エラー:", error);
        throw error;
      }
      
      console.log("Supabase deleteGroup 成功:", id); // デバッグ用
      return true;
    } catch (error) {
      console.error("グループ削除エラー:", error);
      throw error;
    }
  },

  // ブックマーク追加
  addBookmark: async (params: {
    group_id: string;
    name: string;
    url: string;
    icon: string;
    position_x?: number;
    position_y?: number;
  }) => {
    try {
      // position_x, position_yが指定されていない場合、グループの左上を基準に配置
      let finalPositionX = params.position_x ?? 0;
      let finalPositionY = params.position_y ?? 0;

      if (params.position_x === undefined || params.position_y === undefined) {
        // グループ情報を取得
        const { data: groupData, error: groupError } = await supabase
          .from('bookmark_group')
          .select('position_x, position_y')
          .eq('id', params.group_id)
          .maybeSingle();

        if (groupError) {
          console.error("グループ取得エラー:", groupError);
          throw groupError;
        }

        if (groupData) {
          // グループの左上から少しオフセット（20px）した位置に配置
          finalPositionX = (groupData.position_x || 0) + 20;
          finalPositionY = (groupData.position_y || 0) + 40; // ヘッダー分を考慮
        }
      }

      const { data, error } = await supabase
        .from('bookmark')
        .insert([
          {
            group_id: params.group_id,
            name: params.name,
            url: params.url,
            icon: params.icon,
            position_x: finalPositionX,
            position_y: finalPositionY,
          },
        ])
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("ブックマーク追加エラー:", error);
      throw error;
    }
  },

  // ブックマーク編集
  updateBookmark: async (id: string, params: {
    name?: string;
    url?: string;
    icon?: string;
    position_x?: number;
    position_y?: number;
  }) => {
    console.log("Supabase updateBookmark 開始:", id, params); // デバッグ用
    const { data, error } = await supabase
      .from('bookmark')
      .update(params)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error("Supabase updateBookmark エラー:", error); // デバッグ用
      console.error("エラー詳細:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }); // デバッグ用
      throw error;
    }
    
    console.log("Supabase updateBookmark 成功:", data); // デバッグ用
    return data;
  },

  // ブックマーク削除
  deleteBookmark: async (id: string) => {
    console.log("Supabase deleteBookmark 開始:", id); // デバッグ用
    const { error } = await supabase
      .from('bookmark')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Supabase deleteBookmark エラー:", error); // デバッグ用
      console.error("エラー詳細:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }); // デバッグ用
      throw error;
    }
    
    console.log("Supabase deleteBookmark 成功:", id); // デバッグ用
    return true;
  },

  // キャンバスの公開状態を更新
  updateCanvasPublicStatus: async (canvasId: string, isPublic: boolean): Promise<Canvas> => {
    console.log("Supabase updateCanvasPublicStatus 開始:", canvasId, isPublic); // デバッグ用
    
    try {
      // まず、キャンバスが存在するかチェック
      const existingCanvas = await api.getCanvas(canvasId);
      if (!existingCanvas) {
        throw new Error('Canvas not found');
      }

      // 現在のユーザーがキャンバスの所有者かチェック
      // 注意: 実際の実装では、現在のユーザーIDを取得してチェックする必要があります
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      if (existingCanvas.user_id !== userData.user.id) {
        throw new Error('Unauthorized: You can only modify your own canvases');
      }

      // 公開状態を更新
      const { data, error } = await supabase
        .from('canvas')
        .update({ is_public: isPublic })
        .eq('id', canvasId)
        .select('id, user_id, title, is_public, created_at, updated_at')
        .maybeSingle();

      if (error) {
        console.error("公開状態更新エラー:", error);
        throw error;
      }

      if (!data) {
        throw new Error('Failed to update canvas public status');
      }

      console.log("Supabase updateCanvasPublicStatus 成功:", canvasId); // デバッグ用
      
      return {
        ...data,
        public: data.is_public,
      };
    } catch (error) {
      console.error("Supabase updateCanvasPublicStatus エラー:", error);
      throw error;
    }
  },

  // 公開キャンバスを取得（認証不要）
  getPublicCanvas: async (canvasId: string): Promise<Canvas | null> => {
    console.log("Supabase getPublicCanvas 開始:", canvasId); // デバッグ用
    
    try {
      // 公開されているキャンバスのみを取得
      const { data, error } = await supabase
        .from('canvas')
        .select('id, user_id, title, is_public, created_at, updated_at')
        .eq('id', canvasId)
        .eq('is_public', true) // 公開キャンバスのみ
        .maybeSingle();

      if (error) {
        console.error("公開キャンバス取得エラー:", error);
        throw error;
      }

      if (!data) {
        console.log("公開キャンバスが見つかりません:", canvasId);
        return null;
      }

      console.log("Supabase getPublicCanvas 成功:", canvasId); // デバッグ用
      
      return {
        ...data,
        public: data.is_public,
      };
    } catch (error) {
      console.error("Supabase getPublicCanvas エラー:", error);
      throw error;
    }
  },

  // ユニークなキャンバス名を生成
  generateUniqueCanvasTitle: async (userId: string, baseTitle: string, excludeCanvasId?: string): Promise<string> => {
    try {
      // ユーザーの既存キャンバスタイトル一覧を取得
      const existingCanvases = await api.getCanvases(userId);
      
      // 編集中のキャンバスは除外
      const filteredCanvases = excludeCanvasId 
        ? existingCanvases.filter(canvas => canvas.id !== excludeCanvasId)
        : existingCanvases;
      
      const existingTitles = filteredCanvases.map(canvas => canvas.title);
      
      // ベースタイトルが重複していない場合はそのまま返す
      if (!existingTitles.includes(baseTitle)) {
        return baseTitle;
      }
      
      // 重複している場合は連番を振る
      let counter = 2;
      let newTitle = `${baseTitle} (${counter})`;
      
      while (existingTitles.includes(newTitle)) {
        counter++;
        newTitle = `${baseTitle} (${counter})`;
      }
      
      return newTitle;
    } catch (error) {
      console.error("ユニークタイトル生成エラー:", error);
      // エラーが発生した場合はタイムスタンプを追加
      return `${baseTitle} (${Date.now()})`;
    }
  },

  // サンプルキャンバス作成（Webアプリ開発用）
  createSampleWebDevCanvas: async (userId: string) => {
    try {
      // 1. ユニークなタイトルを生成
      const uniqueTitle = await api.generateUniqueCanvasTitle(userId, "Webアプリ開発ツール 🚀");
      
      // 2. キャンバス作成
      const canvas = await api.addCanvas({
        user_id: userId,
        title: uniqueTitle,
      });

      if (!canvas || !canvas.id) {
        throw new Error("キャンバスの作成に失敗しました");
      }

      // 3. グループ作成（フロントエンドとバックエンドのみ、サイズを拡大）
      const groups = [
        {
          name: "フロントエンド",
          position_x: 50,
          position_y: 50,
          width: 600,
          height: 600,
        },
        {
          name: "バックエンド",
          position_x: 700,
          position_y: 50,
          width: 600,
          height: 600,
        },
      ];

      const createdGroups = [];
      for (const group of groups) {
        const createdGroup = await api.addGroup({
          canvas_id: canvas.id,
          ...group,
        });
        if (createdGroup) {
          createdGroups.push(createdGroup);
        }
      }

      // 4. ブックマーク作成（2つのグループに配置）
      const bookmarksData = [
        // フロントエンド (グループ座標: 50, 50)
        {
          groupIndex: 0,
          bookmarks: [
            {
              name: "React",
              url: "https://react.dev/",
              icon: "https://react.dev/favicon.ico",
              position_x: 120,  // 50 + 70
              position_y: 130,  // 50 + 80
            },
            {
              name: "Next.js",
              url: "https://nextjs.org/",
              icon: "https://nextjs.org/favicon.ico",
              position_x: 370,  // 50 + 320
              position_y: 130,  // 50 + 80
            },
            {
              name: "Vue.js",
              url: "https://vuejs.org/",
              icon: "https://vuejs.org/logo.svg",
              position_x: 120,  // 50 + 70
              position_y: 390,  // 50 + 340
            },
            {
              name: "TypeScript",
              url: "https://www.typescriptlang.org/",
              icon: "https://www.typescriptlang.org/favicon-32x32.png",
              position_x: 370,  // 50 + 320
              position_y: 390,  // 50 + 340
            },
          ],
        },
        // バックエンド (グループ座標: 700, 50)
        {
          groupIndex: 1,
          bookmarks: [
            {
              name: "Node.js",
              url: "https://nodejs.org/",
              icon: "https://nodejs.org/favicon.ico",
              position_x: 770,  // 700 + 70
              position_y: 130,  // 50 + 80
            },
            {
              name: "Express.js",
              url: "https://expressjs.com/",
              icon: "https://expressjs.com/images/favicon.png",
              position_x: 1020, // 700 + 320
              position_y: 130,  // 50 + 80
            },
            {
              name: "PostgreSQL",
              url: "https://www.postgresql.org/",
              icon: "https://www.postgresql.org/favicon.ico",
              position_x: 770,  // 700 + 70
              position_y: 390,  // 50 + 340
            },
            {
              name: "Supabase",
              url: "https://supabase.com/",
              icon: "https://supabase.com/favicon.ico",
              position_x: 1020, // 700 + 320
              position_y: 390,  // 50 + 340
            },
          ],
        },
      ];

      // ブックマーク作成
      for (const groupData of bookmarksData) {
        const group = createdGroups[groupData.groupIndex];
        if (group) {
          for (const bookmark of groupData.bookmarks) {
            await api.addBookmark({
              group_id: group.id,
              name: bookmark.name,
              url: bookmark.url,
              icon: bookmark.icon,
              position_x: bookmark.position_x,
              position_y: bookmark.position_y,
            });
          }
        }
      }

      return canvas;
    } catch (error) {
      console.error("サンプルキャンバス作成エラー:", error);
      throw error;
    }
  },
}; 