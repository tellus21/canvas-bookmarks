import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.describe('ユーザージャーニー：ホームページからサインイン', () => {
    test('ホームページ → サインインページへの遷移', async ({ page }) => {
      // ホームページに移動
      await page.goto('/');
      
      // 「今すぐ始める」ボタンをクリック
      await page.getByText('今すぐ始める').click();
      
      // サインインページに遷移することを確認
      await expect(page).toHaveURL('/signin');
      
      // サインインフォームが表示されることを確認
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'ログイン', exact: true })).toBeVisible();
    });

    test('サインインページのフォーム要素の確認', async ({ page }) => {
      await page.goto('/signin');
      
      // フォーム要素が正しく表示されることを確認
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByText('Googleでログイン')).toBeVisible();
      await expect(page.getByText('新規登録')).toBeVisible();
    });

    test('新規登録リンクの動作', async ({ page }) => {
      await page.goto('/signin');
      
      // 新規登録リンクをクリック
      await page.getByRole('link', { name: '新規登録' }).click();
      
      // 新規登録ページに遷移することを確認
      await expect(page).toHaveURL('/signup');
      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
    });
  });

  test.describe('実際の認証テスト（環境依存）', () => {
    // 注意: 以下のテストは実際のSupabaseアカウントとテストデータが必要です
    
    test.skip('有効な認証情報でのログイン', async ({ page }) => {
      // このテストは実際のテスト環境でのみ実行
      // テスト用のユーザーアカウントが必要
      
      await page.goto('/signin');
      
      // テスト用認証情報（実際の環境では環境変数から取得）
      const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
      const testPassword = process.env.TEST_USER_PASSWORD || 'test123456';
      
      // フォーム入力
      await page.locator('input[type="email"]').fill(testEmail);
      await page.locator('input[type="password"]').fill(testPassword);
      
      // ログインボタンをクリック
      await page.locator('button[type="submit"]').click();
      
      // キャンバスページに遷移することを確認
      await expect(page).toHaveURL('/canvas');
      
      // ヘッダーにユーザー情報が表示されることを確認
      await expect(page.getByText('My Canvases')).toBeVisible();
    });

    test.skip('無効な認証情報でのログイン', async ({ page }) => {
      await page.goto('/signin');
      
      // 無効な認証情報
      await page.locator('input[type="email"]').fill('invalid@example.com');
      await page.locator('input[type="password"]').fill('wrongpassword');
      
      // ログインボタンをクリック
      await page.locator('button[type="submit"]').click();
      
      // エラーメッセージが表示されることを確認
      await expect(page.getByText(/エラー|Invalid/)).toBeVisible();
      
      // サインインページに留まることを確認
      await expect(page).toHaveURL('/signin');
    });
  });

  test.describe('認証状態に応じたナビゲーション', () => {
    test('未ログイン時のヘッダー表示', async ({ page }) => {
      await page.goto('/');
      
      // ヘッダーにSign Inリンクが表示されることを確認
      await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    });

    test('保護されたページへの直接アクセス', async ({ page }) => {
      // 未ログイン状態で/canvasに直接アクセス
      await page.goto('/canvas');
      
      // サインインページにリダイレクトされることを確認
      await expect(page).toHaveURL('/signin');
    });
  });
}); 