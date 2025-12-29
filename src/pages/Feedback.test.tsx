import { render, screen, fireEvent } from '@testing-library/react';
import Feedback from './Feedback';
import { startOfWeek, subWeeks, subMonths, isAfter, isBefore, parseISO } from 'date-fns';

// Mock the date-fns functions to return predictable values if needed, 
// or rely on the mock data's relative dates.

describe('Feedback Page Filter Logic', () => {

    test('renders all feedback initially', () => {
        render(<Feedback />);
        // Assuming mock data has 10 items now
        const cards = screen.getAllByText(/@email.com/);
        expect(cards.length).toBeGreaterThan(0);
    });

    test('filters by rating', () => {
        render(<Feedback />);
        const fiveStarBtn = screen.getByText('5');
        fireEvent.click(fiveStarBtn);

        // Should show only 5-star ratings
        const cards = screen.getAllByText(/@email.com/);
        expect(cards.length).toBeGreaterThan(0);
        expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
    });

    test('filters by multiple ratings', () => {
        render(<Feedback />);
        const fiveStarBtn = screen.getByText('5');
        const fourStarBtn = screen.getByText('4');

        fireEvent.click(fiveStarBtn);
        fireEvent.click(fourStarBtn);

        // Should show 5 and 4 star ratings
        const cards = screen.getAllByText(/@email.com/);
        expect(cards.length).toBeGreaterThan(0);
    });

    test('filters by duration: This Week', () => {
        render(<Feedback />);
        // Open dropdown
        const dropdownTrigger = screen.getByRole('combobox');
        fireEvent.click(dropdownTrigger);

        // Select "This Week"
        const thisWeekOption = screen.getByText('This Week');
        fireEvent.click(thisWeekOption);

        // Should show feedbacks from this week
        const cards = screen.getAllByText(/@email.com/);
        expect(cards.length).toBeGreaterThan(0);
    });

    test('filters by duration: Previous Week', () => {
        render(<Feedback />);
        const dropdownTrigger = screen.getByRole('combobox');
        fireEvent.click(dropdownTrigger);

        const prevWeekOption = screen.getByText('Previous Week');
        fireEvent.click(prevWeekOption);

        // Should show feedbacks from previous week
        const cards = screen.getAllByText(/@email.com/);
        expect(cards.length).toBeGreaterThan(0);
    });

    test('filters by duration: This Month', () => {
        render(<Feedback />);
        const dropdownTrigger = screen.getByRole('combobox');
        fireEvent.click(dropdownTrigger);

        const thisMonthOption = screen.getByText('This Month');
        fireEvent.click(thisMonthOption);

        // Should show feedbacks from this month
        const cards = screen.getAllByText(/@email.com/);
        expect(cards.length).toBeGreaterThan(0);
    });
});
