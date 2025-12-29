import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Star, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";
import { startOfWeek, subWeeks, startOfMonth, isAfter, isBefore, parseISO } from "date-fns";
import { BackgroundGlow } from "@/components/ui/background-glow";

interface FeedbackItem {
  id: string;
  citizenName: string;
  email: string;
  feedback: string;
  rating: number;
  date: string; // ISO format for easier parsing
  location: string;
}

// API Response Interface
interface ApiFeedback {
  feedbackId: string;
  studentEmail: string;
  studentName: string;
  accountEmail: string;
  accountName: string;
  rating: number;
  feedbackText: string;
  universityEmail: string;
  createdAt: string;
}

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [userDepartment, setUserDepartment] = useState<string>("Department");
  const location = useLocation();

  // Fetch Feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      const accountEmail = localStorage.getItem("accountEmail");

      if (!accountEmail) {
        console.error("No account email found in localStorage");
        return;
      }

      try {
        const response = await fetch(`https://campusai-916628151603.asia-south1.run.app/api/account/feedback/${accountEmail}?limit=100`);
        const data = await response.json();

        if (data.feedbacks) {
          const mappedFeedbacks: FeedbackItem[] = data.feedbacks.map((item: ApiFeedback) => ({
            id: item.feedbackId,
            citizenName: item.studentName,
            email: item.studentEmail,
            feedback: item.feedbackText,
            rating: item.rating,
            date: item.createdAt,
            location: item.accountName // Using accountName as location/context
          }));
          setFeedbacks(mappedFeedbacks);
          setFilteredFeedbacks(mappedFeedbacks);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        // Fallback to mock data or empty state could be handled here
      }
    };

    fetchFeedbacks();
  }, []);

  // Reset filters when location changes (e.g. clicking sidebar link)
  useEffect(() => {
    setSelectedRating(null);
    setSelectedDuration("all");
  }, [location.key]);

  useEffect(() => {
    const accountStr = localStorage.getItem("account");
    if (accountStr) {
      try {
        const account = JSON.parse(accountStr);
        if (account.accountName) {
          setUserDepartment(account.accountName);
        }
      } catch (e) {
        console.error("Failed to parse account", e);
      }
    } else {
      const dept = localStorage.getItem("userDepartment");
      if (dept) {
        setUserDepartment(dept.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "));
      }
    }
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = feedbacks;

    // Rating Filter
    if (selectedRating !== null) {
      result = result.filter((f) => f.rating === selectedRating);
    }

    // Duration Filter
    const now = new Date();
    const startOfThisWeek = startOfWeek(now);
    const startOfLastWeek = subWeeks(startOfThisWeek, 1);
    const startOfThisMonth = startOfMonth(now);

    if (selectedDuration === "this-week") {
      result = result.filter((f) => isAfter(parseISO(f.date), startOfThisWeek));
    } else if (selectedDuration === "prev-week") {
      result = result.filter((f) =>
        isAfter(parseISO(f.date), startOfLastWeek) && isBefore(parseISO(f.date), startOfThisWeek)
      );
    } else if (selectedDuration === "this-month") {
      result = result.filter((f) => isAfter(parseISO(f.date), startOfThisMonth));
    }

    setFilteredFeedbacks(result);
  }, [selectedRating, selectedDuration, feedbacks]);

  const toggleRating = (rating: number) => {
    setSelectedRating((prev) => (prev === rating ? null : rating));
  };

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return "bg-red-600 text-white hover:bg-red-700 border-red-600";
      case 2: return "bg-orange-500 text-white hover:bg-orange-600 border-orange-500";
      case 3: return "bg-yellow-500 text-black hover:bg-yellow-600 border-yellow-500";
      case 4: return "bg-green-500 text-white hover:bg-green-600 border-green-500";
      case 5: return "bg-green-700 text-white hover:bg-green-800 border-green-700";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const FeedbackCard = ({ feedback }: { feedback: FeedbackItem }) => (
    <GlowingCard className="h-full flex flex-col p-0">
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{feedback.citizenName}</p>
              <p className="text-xs text-muted-foreground">{feedback.email}</p>
            </div>
          </div>
          <Badge className={cn("flex items-center gap-1", getRatingColor(feedback.rating))}>
            {feedback.rating} <Star className="h-3 w-3 fill-current" />
          </Badge>
        </div>

        <div className="mb-4 flex-1">
          <p className="text-sm text-foreground line-clamp-3">
            "{feedback.feedback}"
          </p>
        </div>

        <div className="flex items-end justify-between mt-auto pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">{feedback.location}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(feedback.date).toLocaleString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}
          </p>
        </div>
      </CardContent>
    </GlowingCard>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/60 px-6 glass">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
            <div className="flex-1" />
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 relative">
            <BackgroundGlow />
            <div className="relative z-10">
              {/* Filter Bar */}
              <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card/50 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Filter by Rating:
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRating(star)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-full transition-all",
                          selectedRating === star
                            ? getRatingColor(star)
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {star}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    Duration:
                  </span>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="prev-week">Previous Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Feedback Grid */}
              {filteredFeedbacks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFeedbacks.map((feedback) => (
                    <FeedbackCard key={feedback.id} feedback={feedback} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-card/30 rounded-lg border border-dashed border-border">
                  {feedbacks.length === 0 ? "Loading feedbacks..." : "No feedback found matching your filters."}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Feedback;
