import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: {
        id: string;
        title: string;
    } | null;
}

export function FeedbackDialog({ open, onOpenChange, service }: FeedbackDialogProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    // Reset state when dialog opens/closes or service changes
    useEffect(() => {
        if (!open) {
            // Small delay to prevent flickering during close animation
            const timer = setTimeout(() => {
                setRating(0);
                setHoverRating(0);
                setComment("");
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const handleSave = () => {
        if (!service) return;

        const feedbackData = {
            serviceId: service.id,
            rating,
            comment,
            timestamp: new Date().toISOString(),
        };

        console.log("Feedback submitted:", feedbackData);

        // Save to localStorage as draft/fallback
        try {
            const existing = localStorage.getItem("slh_feedback_draft");
            const drafts = existing ? JSON.parse(existing) : [];
            drafts.push(feedbackData);
            localStorage.setItem("slh_feedback_draft", JSON.stringify(drafts));
        } catch (e) {
            console.error("Failed to save feedback to localStorage", e);
        }

        onOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setRating(starIndex);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            const next = Math.min(5, starIndex + 1);
            setRating(next);
            // Focus logic would be more complex here, keeping it simple for now
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            const prev = Math.max(1, starIndex - 1);
            setRating(prev);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-card border-border/40">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Give Feedback</DialogTitle>
                    <DialogDescription>
                        Rate your experience with <span className="font-medium text-foreground">{service?.title}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Rating Stars */}
                    <div
                        className="flex justify-center gap-2"
                        role="radiogroup"
                        aria-label="Rating"
                    >
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                role="radio"
                                aria-checked={rating === star}
                                aria-label={`${star} stars`}
                                className={cn(
                                    "p-1 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    "hover:scale-110 active:scale-95"
                                )}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                onKeyDown={(e) => handleKeyDown(e, star)}
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors duration-200",
                                        (hoverRating || rating) >= star
                                            ? "fill-yellow-500 text-yellow-500"
                                            : "fill-transparent text-muted-foreground/40"
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Tell us more about your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px] bg-secondary/30 resize-none focus-visible:ring-primary/50"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="hover:bg-secondary/50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={rating === 0 || !comment.trim()}
                        className="bg-primary hover:bg-primary/90"
                    >
                        Save Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
