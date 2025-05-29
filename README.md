# CanvasBookmarks

ブックマークを視覚的に整理できるツールです。

## 開発環境のセットアップ

```bash
npm install
npm run dev
```

## テスト

このプロジェクトでは、Playwright（E2Eテスト）とVitest（ユニットテスト）を使用しています。

### ユニットテスト（Vitest + React Testing Library）

```bash
# テストを実行（ウォッチモード）
npm run test

# テストを一度だけ実行
npm run test:run

# テストUIを開く
npm run test:ui

# カバレッジレポートを生成
npm run test:coverage
```

### E2Eテスト（Playwright）

```bash
# E2Eテストを実行
npm run test:e2e

# E2EテストをUIモードで実行
npm run test:e2e:ui

# E2Eテストをデバッグモードで実行
npm run test:e2e:debug
```

## テストファイルの構成

```
tests/
├── setup.ts              # Vitestのセットアップファイル
├── unit/                 # ユニットテスト
│   ├── Header.test.tsx
│   └── HomePage.test.tsx
├── integration/          # 統合テスト
└── e2e/                  # E2Eテスト
    └── homepage.spec.ts
```

## テストの書き方

### ユニットテスト

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { YourComponent } from '@/components/YourComponent'

describe('YourComponent', () => {
  it('正しくレンダリングされる', () => {
    render(<YourComponent />)
    expect(screen.getByText('期待するテキスト')).toBeInTheDocument()
  })
})
```

### E2Eテスト

```typescript
import { test, expect } from '@playwright/test'

test('ページが正しく動作する', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('期待するテキスト')).toBeVisible()
})
```

## 技術スタック

- **フレームワーク**: Next.js 15
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: Radix UI
- **データベース**: Supabase
- **テスト**: 
  - ユニットテスト: Vitest + React Testing Library
  - E2Eテスト: Playwright

## ライセンス

MIT
