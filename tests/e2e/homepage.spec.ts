import { test, expect } from '@playwright/test';

test.describe('ホームページ', () => {
  test('ページが正しく読み込まれる', async ({ page }) => {
    await page.goto('/');

    // ページタイトルをチェック
    await expect(page).toHaveTitle(/CanvasBookmarks/);
  });

  test('メインコンテンツが表示される', async ({ page }) => {
    await page.goto('/');

    // メインタイトルが表示されているかチェック
    await expect(page.getByText('ブックマークを視覚的に整理')).toBeVisible();

    // 説明文が表示されているかチェック
    await expect(page.getByText(/CanvasBookmarksは、ブックマークをカードのように配置して/)).toBeVisible();

    // 「今すぐ始める」ボタンが表示されているかチェック
    await expect(page.getByText('今すぐ始める')).toBeVisible();
  });

  test.describe('「今すぐ始める」ボタンのテスト', () => {
    test('デフォルト状態（未ログイン）：サインインページにリダイレクトされる', async ({ page }) => {
      await page.goto('/');

      // ボタンをクリック
      await page.getByText('今すぐ始める').click();

      // サインインページにリダイレクトされることを確認
      await expect(page).toHaveURL('/signin');
      
      // サインインページの要素が表示されることを確認（直接的なセレクター）
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('ログインフローテスト：サインインページからキャンバスページに遷移', async ({ page }) => {
      await page.goto('/');
      
      // 「今すぐ始める」ボタンをクリック
      await page.getByText('今すぐ始める').click();
      
      // サインインページに遷移することを確認
      await expect(page).toHaveURL('/signin');
      
      // この時点で実際のログインをテストしたい場合は、
      // テスト用のユーザーアカウントを使用してログイン処理を実行
      // （実際のSupabaseとの連携が必要）
      
      // 注意: このテストは実際のログイン機能の実装後に完成します
      // 現在はサインインページへの遷移のみをテスト
    });
  });

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // メインコンテンツが表示されているかチェック
    await expect(page.getByText('ブックマークを視覚的に整理')).toBeVisible();

    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();

    // メインコンテンツが表示されているかチェック
    await expect(page.getByText('ブックマークを視覚的に整理')).toBeVisible();
  });
}); 