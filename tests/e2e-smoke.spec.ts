import { test, expect } from '@playwright/test';

test('smoke test: login -> dashboard -> logout', async ({ page }) => {
    // Mock API calls
    await page.route('**/api/auth/login', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ token: 'test-token', providerEmail: 'test@gov.in' }),
        });
    });

    await page.route('**/api/providers/*/questions/sse', async route => {
        // Keep connection open but don't send anything for now, or send a dummy event
        // Playwright route doesn't easily support streaming, but we can verify the request was made
        await route.fulfill({
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
            body: 'data: {"id":"1","text":"Test Question"}\n\n',
        });
    });

    // 1. Go to Login
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // 2. Login
    await page.fill('input[type="email"]', 'test@gov.in');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // 3. Verify Redirect to Dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // 4. Verify LocalStorage (via script)
    const token = await page.evaluate(() => localStorage.getItem('slh_token'));
    expect(token).toBe('test-token');

    // 5. Verify Dashboard Content
    await expect(page.getByText('Dashboard')).toBeVisible();

    // 6. Logout
    await page.click('button:has-text("AD")'); // Avatar button
    await page.click('text=Log out');

    // 7. Verify Redirect to Login and Storage Cleared
    await expect(page).toHaveURL(/\/login/);
    const tokenAfter = await page.evaluate(() => localStorage.getItem('slh_token'));
    expect(tokenAfter).toBeNull();
});
