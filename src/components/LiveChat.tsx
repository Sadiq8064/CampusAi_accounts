import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingCard } from "@/components/ui/glowing-card";
import { ArrowRight, ArrowDown, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    question: string;
    answer: string;
    timestamp: Date;
    isExpanded: boolean;
}

const SIMULATED_USERS = [
    { name: "Rajesh Kumar", avatar: "RK" },
    { name: "Priya Sharma", avatar: "PS" },
    { name: "Amit Patel", avatar: "AP" },
    { name: "Sneha Gupta", avatar: "SG" },
    { name: "Vikram Singh", avatar: "VS" },
    { name: "Anjali Desai", avatar: "AD" },
];

const SIMULATED_QA = [
    {
        q: "How do I apply for a new water connection?",
        a: "You can apply for a new water connection by visiting the 'Services' tab and selecting 'Water Connection'. You'll need to upload your property documents and ID proof."
    },
    {
        q: "What are the timings for the municipal park?",
        a: "The municipal park is open from 5:00 AM to 9:00 PM every day. Maintenance hours are 10:00 AM to 12:00 PM on Tuesdays."
    },
    {
        q: "Garbage was not collected today in Sector 4.",
        a: "We apologize for the inconvenience. There might be a delay due to vehicle maintenance. I've raised a ticket (TKT-8821) for your area."
    },
    {
        q: "How can I pay my property tax online?",
        a: "Property tax can be paid via the 'Payments' section. We accept credit cards, net banking, and UPI. Ensure you have your Property ID handy."
    },
    {
        q: "Is there a vaccination camp this weekend?",
        a: "Yes, a vaccination camp is scheduled for this Saturday at the Community Center, Sector 12, from 9 AM to 4 PM."
    },
    {
        q: "Street light on Main Road is flickering.",
        a: "Thank you for reporting. I've logged a complaint (CMP-9920) with the electrical department. It should be fixed within 24 hours."
    },
    {
        q: "Where can I download the birth certificate?",
        a: "Birth certificates can be downloaded from the 'Documents' section after logging in. You'll need the registration number."
    },
    {
        q: "Is the public library open on Sundays?",
        a: "Yes, the public library is open on Sundays from 10:00 AM to 4:00 PM."
    },
    {
        q: "How do I report a pothole?",
        a: "You can report potholes using the 'Report Issue' feature in the app. Please upload a photo for faster processing."
    },
    {
        q: "When is the next town hall meeting?",
        a: "The next town hall meeting is scheduled for the 15th of next month at the City Hall auditorium."
    },
    {
        q: "Can I pay my water bill online?",
        a: "Absolutely! Go to the 'Payments' tab and select 'Water Bill'. You can pay using credit/debit cards or UPI."
    },
    {
        q: "What documents are needed for a driving license?",
        a: "You need proof of age, proof of address, and a passport-sized photograph. Visit the 'Transport' section for more details."
    },
    {
        q: "Is there a fine for late property tax payment?",
        a: "Yes, a penalty of 2% per month is applicable for late payments. Please pay before the due date to avoid fines."
    },
    {
        q: "How do I register for the marathon?",
        a: "Registration for the city marathon is open on the 'Events' page. Early bird discounts are available until Friday."
    },
    {
        q: "My garbage bin is damaged. How do I get a new one?",
        a: "Please submit a request under 'Waste Management'. A replacement bin will be delivered to your address within 3 working days."
    }
];

export function LiveChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastScrollTop = useRef(0);

    // Simulate live feed
    useEffect(() => {
        const addMessage = () => {
            const randomUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
            const randomQA = SIMULATED_QA[Math.floor(Math.random() * SIMULATED_QA.length)];

            const newMessage: Message = {
                id: Math.random().toString(36).substr(2, 9),
                user: randomUser,
                question: randomQA.q,
                answer: randomQA.a,
                timestamp: new Date(),
                isExpanded: false,
            };

            setMessages(prev => [...prev, newMessage]);
        };

        // Add initial messages
        if (messages.length === 0) {
            for (let i = 0; i < 3; i++) {
                addMessage();
            }
        }

        const interval = setInterval(() => {
            addMessage();
        }, 800 + Math.random() * 2000); // Faster interval between 0.8-2.8s

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll logic
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            const scrollElement = scrollRef.current;
            // Use setTimeout to ensure DOM is updated
            setTimeout(() => {
                scrollElement.scrollTo({
                    top: scrollElement.scrollHeight,
                    behavior: "smooth"
                });
            }, 100);
        }
    }, [messages, autoScroll]);

    const handleScroll = () => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;

        // If user scrolls up, stop auto-scroll
        if (scrollTop < lastScrollTop.current && !isAtBottom) {
            setAutoScroll(false);
            setShowScrollButton(true);
        }
        // If user scrolls back to bottom, resume auto-scroll
        else if (isAtBottom) {
            setAutoScroll(true);
            setShowScrollButton(false);
        }

        lastScrollTop.current = scrollTop;
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
            setAutoScroll(true);
            setShowScrollButton(false);
        }
    };

    const toggleResponse = (id: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, isExpanded: !msg.isExpanded } : msg
        ));
    };

    return (
        <GlowingCard className="h-[600px] flex flex-col relative overflow-hidden border-primary/20 p-0">
            <CardHeader className="pb-3 border-b border-border/50 bg-primary/5 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="relative">
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    Live Citizen Queries
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-0 relative">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-scroll p-4 space-y-4 scroll-smooth live-chat-scrollbar"
                >
                    {messages.map((msg) => (
                        <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex gap-3 group">
                                <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {msg.user.avatar}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {msg.user.name}
                                            </p>
                                            <p className="text-sm text-foreground leading-relaxed">
                                                {msg.question}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-6 w-6 shrink-0 transition-transform duration-200",
                                                msg.isExpanded && "rotate-90"
                                            )}
                                            onClick={() => toggleResponse(msg.id)}
                                        >
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>

                                    {/* AI Response */}
                                    <div className={cn(
                                        "grid transition-all duration-300 ease-in-out",
                                        msg.isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    )}>
                                        <div className="overflow-hidden">
                                            <div className="bg-primary/5 rounded-lg p-3 text-sm border border-primary/10 mt-1">
                                                <div className="flex items-center gap-2 mb-1 text-primary text-xs font-semibold">
                                                    <Bot className="h-3 w-3" />
                                                    AI Response:
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    {msg.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Spacer for scrolling */}
                    <div className="h-4" />
                </div>

                {/* Resume Auto-scroll Button */}
                {showScrollButton && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-in fade-in zoom-in duration-300">
                        <Button
                            onClick={scrollToBottom}
                            size="icon"
                            className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25 text-white"
                        >
                            <ArrowDown className="h-6 w-6" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </GlowingCard>
    );
}
