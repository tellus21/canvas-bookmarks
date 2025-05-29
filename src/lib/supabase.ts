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
  getCanvases: async (): Promise<Canvas[]> => {
    const { data, error } = await supabase
      .from('canvas')
      .select('id, user_id, title, is_public, created_at')
      .order('created_at', { ascending: false });
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

  // グループ削除
  deleteGroup: async (id: string) => {
    const { error } = await supabase
      .from('bookmark_group')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
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
    const { data, error } = await supabase
      .from('bookmark')
      .insert([
        {
          group_id: params.group_id,
          name: params.name,
          url: params.url,
          icon: params.icon,
          position_x: params.position_x ?? 0,
          position_y: params.position_y ?? 0,
        },
      ])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // ブックマーク編集
  updateBookmark: async (id: string, params: {
    name?: string;
    url?: string;
    icon?: string;
    position_x?: number;
    position_y?: number;
  }) => {
    const { data, error } = await supabase
      .from('bookmark')
      .update(params)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // ブックマーク削除
  deleteBookmark: async (id: string) => {
    const { error } = await supabase
      .from('bookmark')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
}; 