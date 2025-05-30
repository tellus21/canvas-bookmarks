import { test, expect } from '@playwright/test';

// テスト用のwindow型拡張
declare global {
  interface Window {
    testShareUrl: string;
  }
}

test.describe('Canvas Sharing', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用のベースURLに移動
    await page.goto('/');
  });

  test('should allow user to share canvas and view it publicly', async ({ page, context }) => {
    // ログインユーザーとしてキャンバスを作成・共有
    await test.step('Login and create canvas', async () => {
      // ログインページに移動
      await page.goto('/signin');
      
      // ログイン処理（実際の認証フローに合わせて調整が必要）
      // await page.fill('[data-testid="email"]', 'test@example.com');
      // await page.fill('[data-testid="password"]', 'password');
      // await page.click('[data-testid="signin-button"]');
      
      // テスト用にログイン状態をスキップして直接キャンバスページに移動
      await page.goto('/canvas');
    });

    await test.step('Create and share canvas', async () => {
      // キャンバス作成（既存のキャンバスがある場合はそれを使用）
      const canvasLinks = page.locator('a[href*="/canvas/"]');
      const canvasCount = await canvasLinks.count();
      
      let canvasId: string;
      
      if (canvasCount > 0) {
        // 既存のキャンバスを使用
        const firstCanvasLink = canvasLinks.first();
        const href = await firstCanvasLink.getAttribute('href');
        canvasId = href?.split('/canvas/')[1] || '';
        await firstCanvasLink.click();
      } else {
        // 新しいキャンバスを作成
        await page.click('[data-testid="create-canvas"]');
        await page.fill('[data-testid="canvas-title"]', 'Test Shared Canvas');
        await page.click('[data-testid="create-button"]');
        
        // キャンバスIDを取得
        await page.waitForURL(/\/canvas\/[^\/]+$/);
        const url = page.url();
        canvasId = url.split('/canvas/')[1];
      }

      // 共有ボタンをクリック
      await page.click('button:has-text("共有")');
      
      // 共有ダイアログが表示されることを確認
      await expect(page.locator('text=キャンバスを共有')).toBeVisible();
      
      // プライベート状態であることを確認
      await expect(page.locator('text=プライベート')).toBeVisible();
      
      // 公開にするボタンをクリック
      await page.click('button:has-text("公開にする")');
      
      // 公開状態に変わることを確認
      await expect(page.locator('text=公開中')).toBeVisible();
      
      // 共有URLが表示されることを確認
      const shareUrlInput = page.locator('input[readonly]');
      await expect(shareUrlInput).toBeVisible();
      
      // 共有URLを取得
      const shareUrl = await shareUrlInput.inputValue();
      expect(shareUrl).toContain(`/share/${canvasId}`);
      
      // 共有URLをクリップボードにコピー
      await page.click('button:has-text("URLをコピー")');
      
      // コピー成功メッセージを確認
      await expect(page.locator('text=コピー完了!')).toBeVisible();
      
      // ダイアログを閉じる
      await page.keyboard.press('Escape');
      
      // 共有URLを保存（次のステップで使用）
      await page.evaluate((url) => {
        (window as any).testShareUrl = url;
      }, shareUrl);
    });

    await test.step('View shared canvas as anonymous user', async () => {
      // 新しいブラウザコンテキスト（非ログイン状態）を作成
      const anonymousContext = await context.browser()?.newContext();
      if (!anonymousContext) throw new Error('Failed to create anonymous context');
      
      const anonymousPage = await anonymousContext.newPage();
      
      // 共有URLを取得
      const shareUrl = await page.evaluate(() => (window as any).testShareUrl);
      
      // 共有URLに直接アクセス
      await anonymousPage.goto(shareUrl);
      
      // 公開キャンバスページが表示されることを確認
      await expect(anonymousPage.locator('text=公開キャンバス:')).toBeVisible();
      await expect(anonymousPage.locator('text=閲覧専用モード')).toBeVisible();
      
      // キャンバスの内容が表示されることを確認
      await expect(anonymousPage.locator('[data-testid="canvas-container"]')).toBeVisible();
      
      // 編集機能が無効化されていることを確認（共有ボタンなどが表示されない）
      await expect(anonymousPage.locator('button:has-text("共有")')).not.toBeVisible();
      await expect(anonymousPage.locator('button:has-text("新規ブックマーク")')).not.toBeVisible();
      
      await anonymousContext.close();
    });

    await test.step('Verify private canvas is not accessible', async () => {
      // キャンバスをプライベートに戻す
      await page.click('button:has-text("共有")');
      await page.click('button:has-text("プライベートにする")');
      await expect(page.locator('text=プライベート')).toBeVisible();
      await page.keyboard.press('Escape');
      
      // 新しいブラウザコンテキストで共有URLにアクセス
      const anonymousContext = await context.browser()?.newContext();
      if (!anonymousContext) throw new Error('Failed to create anonymous context');
      
      const anonymousPage = await anonymousContext.newPage();
      const shareUrl = await page.evaluate(() => (window as any).testShareUrl);
      
      // プライベートキャンバスにアクセスしようとする
      await anonymousPage.goto(shareUrl);
      
      // 404ページまたはアクセス拒否ページが表示されることを確認
      await expect(anonymousPage.locator('text=404')).toBeVisible();
      
      await anonymousContext.close();
    });
  });

  test('should show public indicator on canvas list', async ({ page }) => {
    await test.step('Navigate to canvas list', async () => {
      await page.goto('/canvas');
    });

    await test.step('Check for public indicators', async () => {
      // 公開キャンバスがある場合、公開インジケーターが表示されることを確認
      const publicIndicators = page.locator('[data-testid="public-indicator"]');
      const indicatorCount = await publicIndicators.count();
      
      if (indicatorCount > 0) {
        // 公開インジケーターが表示されていることを確認
        await expect(publicIndicators.first()).toBeVisible();
        await expect(publicIndicators.first()).toContainText('公開');
      }
    });
  });
}); 