import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SettingsDialog } from '../SettingsDialog';
import React from 'react';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock pointer capture methods
window.HTMLElement.prototype.setPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

describe('SettingsDialog Automation', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        global.fetch = vi.fn(() => Promise.resolve({
            json: () => Promise.resolve({})
        })) as any;
    });

    const renderDialog = () => {
        return render(<SettingsDialog open={true} onOpenChange={() => { }} />);
    };

    it('renders automation toggles', async () => {
        const user = userEvent.setup();
        renderDialog();

        const trigger = screen.getByRole('tab', { name: /automation/i });
        await user.click(trigger);

        expect(await screen.findByLabelText('Toggle AI Comment')).toBeInTheDocument();
        expect(screen.getByLabelText('Toggle External Knowledge')).toBeInTheDocument();
    });

    it('toggles AI Comment', async () => {
        const user = userEvent.setup();
        renderDialog();
        const trigger = screen.getByRole('tab', { name: /automation/i });
        await user.click(trigger);

        const toggle = await screen.findByLabelText('Toggle AI Comment');
        expect(toggle).not.toBeChecked();

        await user.click(toggle);
        expect(toggle).toBeChecked();
        expect(localStorage.getItem('aiCommentEnabled')).toBe('true');
    });

    it('opens modal when External Knowledge is toggled ON', async () => {
        const user = userEvent.setup();
        renderDialog();
        const trigger = screen.getByRole('tab', { name: /automation/i });
        await user.click(trigger);

        const toggle = await screen.findByLabelText('Toggle External Knowledge');
        await user.click(toggle);

        expect(await screen.findByText('Configure External Knowledge')).toBeInTheDocument();
        expect(screen.getByLabelText('URL')).toBeInTheDocument();
    });

    it('validates URL in modal', async () => {
        const user = userEvent.setup();
        renderDialog();
        const trigger = screen.getByRole('tab', { name: /automation/i });
        await user.click(trigger);

        const toggle = await screen.findByLabelText('Toggle External Knowledge');
        await user.click(toggle);

        const urlInput = await screen.findByLabelText('URL');
        await user.type(urlInput, 'invalid-url');

        expect(screen.getByText('Invalid URL format')).toBeInTheDocument();

        // Try to save
        const saveButton = screen.getByText('Save changes');
        await user.click(saveButton);

        // Should be closed and toggle OFF
        await waitFor(() => {
            expect(screen.queryByText('Configure External Knowledge')).not.toBeInTheDocument();
        });
        expect(toggle).not.toBeChecked();
    });

    it('saves valid URL and frequency', async () => {
        const user = userEvent.setup();
        renderDialog();
        const trigger = screen.getByRole('tab', { name: /automation/i });
        await user.click(trigger);

        const toggle = await screen.findByLabelText('Toggle External Knowledge');
        await user.click(toggle);

        const urlInput = await screen.findByLabelText('URL');
        await user.type(urlInput, 'https://example.com/webhook');

        const saveButton = screen.getByText('Save changes');
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.queryByText('Configure External Knowledge')).not.toBeInTheDocument();
        });

        expect(toggle).toBeChecked();
        expect(localStorage.getItem('webhookUrl')).toBe('https://example.com/webhook');
        expect(localStorage.getItem('externalKnowledgeEnabled')).toBe('true');
    });

    it('edit button opens modal with saved values', async () => {
        const user = userEvent.setup();
        // Pre-set localStorage
        localStorage.setItem('externalKnowledgeEnabled', 'true');
        localStorage.setItem('webhookUrl', 'https://saved.com/hook');

        renderDialog();
        const trigger = screen.getByRole('tab', { name: /automation/i });
        await user.click(trigger);

        const editButton = await screen.findByText('Edit');
        await user.click(editButton);

        expect(await screen.findByText('Configure External Knowledge')).toBeInTheDocument();
        const urlInput = screen.getByLabelText('URL') as HTMLInputElement;
        expect(urlInput.value).toBe('https://saved.com/hook');
    });
});
