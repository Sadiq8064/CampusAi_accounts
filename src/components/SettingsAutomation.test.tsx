import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsDialog } from './SettingsDialog';
import { Toaster } from 'sonner';

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('Settings Automation Tab', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    test('Automation tab appears and toggle works', () => {
        render(
            <>
                <Toaster />
                <SettingsDialog open={true} onOpenChange={() => { }} />
            </>
        );

        // Click Automation tab
        const automationTab = screen.getByText('Automation');
        fireEvent.click(automationTab);

        // Check header
        expect(screen.getByRole('heading', { name: 'Automation' })).toBeInTheDocument();

        // Check toggle default (OFF)
        const toggle = screen.getByLabelText('Toggle automation');
        expect(toggle).not.toBeChecked();

        // Fields should be disabled
        const urlInput = screen.getByLabelText('Webhook URL');
        expect(urlInput).toBeDisabled();

        // Turn ON
        fireEvent.click(toggle);
        expect(toggle).toBeChecked();
        expect(urlInput).not.toBeDisabled();
    });

    test('URL validation blocks progress', () => {
        render(<SettingsDialog open={true} onOpenChange={() => { }} />);
        fireEvent.click(screen.getByText('Automation'));

        // Turn ON
        fireEvent.click(screen.getByLabelText('Toggle automation'));

        const urlInput = screen.getByLabelText('Webhook URL');
        const saveBtn = screen.getByText('Save Changes');

        // Enter invalid URL
        fireEvent.change(urlInput, { target: { value: 'invalid-url' } });

        // Check error message
        expect(screen.getByText('URL must begin with https:// and be a valid URL')).toBeInTheDocument();

        // Save button should be disabled (or effectively blocked, though my implementation disables it)
        expect(saveBtn).toBeDisabled();

        // Enter valid URL
        fireEvent.change(urlInput, { target: { value: 'https://example.com/webhook' } });

        // Error should be gone
        expect(screen.queryByText('URL must begin with https:// and be a valid URL')).not.toBeInTheDocument();
        expect(saveBtn).not.toBeDisabled();
    });

    test('Save persists values', async () => {
        render(
            <>
                <Toaster />
                <SettingsDialog open={true} onOpenChange={() => { }} />
            </>
        );
        fireEvent.click(screen.getByText('Automation'));
        fireEvent.click(screen.getByLabelText('Toggle automation'));

        const urlInput = screen.getByLabelText('Webhook URL');
        fireEvent.change(urlInput, { target: { value: 'https://api.example.com' } });

        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        // Check toast (mocked or looked for in DOM)
        await waitFor(() => {
            expect(screen.getByText('Automation settings saved successfully.')).toBeInTheDocument();
        });

        // Check localStorage
        expect(window.localStorage.getItem('automationEnabled')).toBe('true');
        expect(window.localStorage.getItem('webhookUrl')).toBe('https://api.example.com');
    });
});
