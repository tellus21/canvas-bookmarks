export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Canvas {
  id: string;
  title: string;
  user_id: string;
  public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  canvas_id: string;
  title: string;
  url: string;
  icon?: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  canvas_id: string;
  title: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
  bookmarks?: Bookmark[];
} 