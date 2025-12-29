import { test, expect } from '@playwright/test';

test('Automation settings workflow', async ({ page }) => {
    // 1. Go to dashboard
    await page.goto('/dashboard');

    // 2. Open Settings
    // Click the avatar button (DropdownMenuTrigger)
    await page.getByRole('button', { name: 'AD' }).click();

    // Click Settings item
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    // Verify Settings dialog is open
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // 3. Go to Automation tab
    await page.getByRole('tab', { name: 'Automation' }).click();
    await expect(page.getByRole('heading', { name: 'Automation' })).toBeVisible();

    // 4. AI Comment Toggle
    const aiToggle = page.getByLabel('Toggle AI Comment'); // aria-label="Toggle AI Comment"
    await expect(aiToggle).not.toBeChecked();
    await aiToggle.click();
    await expect(aiToggle).toBeChecked();

    // 5. External Knowledge Toggle
    const extToggle = page.getByLabel('Toggle External Knowledge'); // aria-label="Toggle External Knowledge"
    await expect(extToggle).not.toBeChecked();

    // Click to turn ON -> should open modal
    await extToggle.click();

    // Verify Modal
    const modal = page.getByRole('dialog', { name: 'Configure External Knowledge' });
    await expect(modal).toBeVisible();

    // 6. Validation
    const urlInput = page.getByLabel('URL');
    const saveBtn = page.getByRole('button', { name: 'Save changes' });

    // Invalid URL
    await urlInput.fill('invalid-url');
    // Check for error message/state
    // The code sets aria-invalid and shows a message
    await expect(page.getByText('Invalid URL format')).toBeVisible(); // Assuming this text appears

    // Save should fail/close and revert? 
    // Requirement: "If Save clicked with missing/invalid URL ... do not save; close modal; turn toggle OFF"
    // But wait, usually validation prevents saving or shows error. 
    // The requirement said: "If Save clicked with missing/invalid URL ... do not save; close modal; turn ... OFF"
    // My implementation:
    /*
      if (!tempUrl || !validateUrl(tempUrl)) {
          setIsModalOpen(false);
          setExternalKnowledgeEnabled(false);
          ...
      }
    */
    // So clicking save with invalid URL *should* close the modal and turn toggle off.
    await saveBtn.click();
    await expect(modal).not.toBeVisible();
    await expect(extToggle).not.toBeChecked();
    await expect(page.getByText('No changes made!')).toBeVisible(); // Toast message

    // 7. Valid Flow
    await extToggle.click(); // Open modal again
    await expect(modal).toBeVisible();

    await urlInput.fill('https://example.com/webhook');
    await expect(page.getByText('Invalid URL format')).not.toBeVisible();

    // Frequency
    const freqSelect = page.getByRole('combobox', { name: 'Update Frequency' }); // Select trigger
    // Initially disabled? No, only if URL invalid.
    // "Initially disabled until URL is valid."
    // Implementation: disabled={!tempUrl || !!urlError}
    await expect(freqSelect).toBeEnabled();

    await freqSelect.click();
    await page.getByRole('option', { name: 'Weekly' }).click();

    await saveBtn.click();

    // Verify success
    await expect(modal).not.toBeVisible();
    await expect(extToggle).toBeChecked();
    await expect(page.getByText('Saved successfully')).toBeVisible();

    // 8. Edit Button
    const editBtn = page.getByRole('button', { name: 'Edit' });
    await expect(editBtn).toBeVisible();

    await editBtn.click();
    await expect(modal).toBeVisible();
    await expect(urlInput).toHaveValue('https://example.com/webhook');
    await expect(page.getByText('Weekly')).toBeVisible(); // Select value
});
