import { render, screen, fireEvent } from "@testing-library/react";
import { FeedbackDialog } from "./FeedbackDialog";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

describe("FeedbackDialog", () => {
    const mockService = { id: "test-service", title: "Test Service" };
    const mockOnOpenChange = vi.fn();

    it("renders correctly when open", () => {
        render(<FeedbackDialog open={true} onOpenChange={mockOnOpenChange} service={mockService} />);
        expect(screen.getByText("Give Feedback")).toBeInTheDocument();
        expect(screen.getByText("Test Service")).toBeInTheDocument();
    });

    it("selects stars correctly on click", async () => {
        render(<FeedbackDialog open={true} onOpenChange={mockOnOpenChange} service={mockService} />);

        const stars = screen.getAllByRole("radio");
        expect(stars).toHaveLength(5);

        // Click 3rd star
        await userEvent.click(stars[2]);

        // Check if 3rd star is checked (logic in component sets rating state)
        // Since we can't easily check internal state, we verify aria-checked
        expect(stars[2]).toHaveAttribute("aria-checked", "true");
        expect(stars[0]).toHaveAttribute("aria-checked", "false"); // 1st star shouldn't be "checked" in radio group sense, but visually filled. 
        // Wait, the component implementation sets aria-checked only on the selected rating.
        // Let's verify that behavior.
    });

    it("disables save button initially", () => {
        render(<FeedbackDialog open={true} onOpenChange={mockOnOpenChange} service={mockService} />);
        const saveBtn = screen.getByText("Save Feedback");
        expect(saveBtn).toBeDisabled();
    });

    it("enables save button when rating and comment are provided", async () => {
        render(<FeedbackDialog open={true} onOpenChange={mockOnOpenChange} service={mockService} />);

        const stars = screen.getAllByRole("radio");
        await userEvent.click(stars[4]); // 5 stars

        const commentInput = screen.getByPlaceholderText("Tell us more about your experience...");
        await userEvent.type(commentInput, "Great service!");

        const saveBtn = screen.getByText("Save Feedback");
        expect(saveBtn).toBeEnabled();
    });
});
