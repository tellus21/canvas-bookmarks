# 🎨 CanvasBookmarks

**ブックマークを視覚的に整理できるWebアプリケーション**

CanvasBookmarksは、キャンバス上にブックマークを配置・整理できるツールです。プロジェクトごとに関連するリンクをまとめたり、学習リソースを整理を視覚的に行うことができます。

## 🎮 使い方

### 1. アカウント作成・ログイン
-  メールアドレスとパスワードでアカウント作成

### 2. 最初のキャンバス作成
```
「新規キャンバス」または「サンプルを作成」をクリック
→ キャンバス名を入力
→ 作成完了！
```

### 3. グループの作成
- 「新規グループ」ボタンをクリック
- グループ名を入力（例：「フロントエンド」「学習リソース」）
- キャンバス上にグループが配置される

### 4. ブックマークの追加
- 「新規ブックマーク」ボタンをクリック
- URL、タイトル、配置するグループを選択
- 自動的にサイトアイコンを取得

### 5. レイアウトの調整
- **移動**: アイテムをドラッグして好きな位置に
- **リサイズ**: グループの角をドラッグしてサイズ変更
- **整理**: 関連するブックマークを近くに配置

### 6. 共有
- 「共有」ボタンから公開設定
- 生成されたリンクをチームに共有

## 💼 使用例

### 🎓 学習・研究
```
「プログラミング学習」キャンバス
├── JavaScript基礎
│   ├── MDN JavaScript Guide
│   ├── JavaScript.info
│   └── Eloquent JavaScript
├── React学習
│   ├── React公式ドキュメント
│   ├── React Tutorial
│   └── React Hooks解説
└── 開発ツール
    ├── VS Code
    ├── Chrome DevTools
    └── Git公式ドキュメント
```

### 🚀 プロジェクト管理
```
「ECサイト開発」キャンバス
├── デザイン参考
│   ├── Pinterest
│   ├── Dribbble
│   └── 競合サイト
├── 技術調査
│   ├── Next.js Commerce
│   ├── Stripe Documentation
│   └── AWS S3 Setup
└── プロジェクト管理
    ├── GitHub Repository
    ├── Figma Design
    └── Slack Channel
```

## 🛠 技術スタック

### フロントエンド
- **Next.js 15**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI**

### バックエンド・データベース
- **Supabase**
- **PostgreSQL**
- **Row Level Security**

### デプロイ環境
- **Vercel**

## 🚀 セットアップ

### 1. プロジェクトのクローン
```bash
git clone https://github.com/your-username/canvas-bookmarks.git
cd canvas-bookmarks
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
```bash
cp .env.example .env.local
```

`.env.local` を編集してSupabaseの認証情報を設定：
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

`http://localhost:3000` でアプリケーションが起動します。

## 📄 ライセンス

MIT License

---