import { test, expect } from '@playwright/test';

test('Feedback Modal Flow', async ({ page }) => {
    // 1. Navigate to Services page (assuming it's accessible via /users-end or similar, but based on previous context, Services is a tab in UsersEnd)
    // We need to navigate to the page where UserServices is rendered.
    // Based on `UsersEnd.tsx`, the Services tab renders `UserServices`.

    await page.goto('http://localhost:8080/users-end');

    // Click on "Services" tab
    await page.getByRole('button', { name: 'Services' }).click();

    // 2. Open Feedback Modal for "Municipal-Road"
    // Find the card with "Municipal-Road" and click "Give Feedback"
    // We can target the button inside the card.
    const roadCard = page.locator('.glass-card').filter({ hasText: 'Municipal-Road' });
    await roadCard.getByRole('button', { name: 'Give Feedback' }).click();

    // Verify modal is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Rate your experience with Municipal-Road')).toBeVisible();

    // 3. Interact with Rating
    // Click the 3rd star (rating = 3)
    // The stars are buttons with aria-label="3 stars"
    await page.getByRole('button', { name: '3 stars' }).click();

    // 4. Type Comment
    await page.getByPlaceholder('Tell us more about your experience...').fill('Test feedback comment');

    // 5. Save
    // Mock console.log to verify output? Or check localStorage.
    // Let's check localStorage after saving.
    await page.getByRole('button', { name: 'Save Feedback' }).click();

    // Verify modal closed
    await expect(page.getByRole('dialog')).toBeHidden();

    // 6. Verify LocalStorage
    const feedback = await page.evaluate(() => {
        const data = localStorage.getItem('slh_feedback_draft');
        return data ? JSON.parse(data) : [];
    });

    expect(feedback).toHaveLength(1);
    expect(feedback[0]).toMatchObject({
        serviceId: 'municipal-road',
        rating: 3,
        comment: 'Test feedback comment'
    });
});
