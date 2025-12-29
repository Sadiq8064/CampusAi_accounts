import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingCard } from "@/components/ui/glowing-card";

interface Message {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    text: string;
    aiResponse: string;
    timestamp: Date;
    isExpanded?: boolean;
}

interface LiveChatPanelProps {
    messages: Message[];
    onOpenResponse?: (id: string) => void;
}

export default function LiveChatPanel({ messages = [], onOpenResponse }: LiveChatPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const [showResumeBtn, setShowResumeBtn] = useState(false);
    const lastSeenRef = useRef<string | null>(null);

    function scrollToBottom(behavior: ScrollBehavior = "smooth") {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    }

    useEffect(() => {
        if (!messages || messages.length === 0) return;
        const lastId = messages[messages.length - 1].id;

        if (isAutoScroll) {
            scrollToBottom();
            setShowResumeBtn(false);
        } else {
            setShowResumeBtn(true);
        }

        lastSeenRef.current = lastId;
    }, [messages, isAutoScroll]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const threshold = 60;

        function onScroll() {
            if (!el) return;
            const atBottom =
                el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;

            if (atBottom) {
                setIsAutoScroll(true);
                setShowResumeBtn(false);
            } else {
                setIsAutoScroll(false);
                const lastId = messages.length
                    ? messages[messages.length - 1].id
                    : null;

                const hasNew = lastId && lastId !== lastSeenRef.current;
                setShowResumeBtn(!!hasNew);
            }
        }

        function onUserInteract() {
            setIsAutoScroll(false);
            setShowResumeBtn(true);
        }

        el.addEventListener("scroll", onScroll, { passive: true });
        el.addEventListener("wheel", onUserInteract, { passive: true });
        el.addEventListener("touchstart", onUserInteract, { passive: true });

        return () => {
            el.removeEventListener("scroll", onScroll);
            el.removeEventListener("wheel", onUserInteract);
            el.removeEventListener("touchstart", onUserInteract);
        };
    }, [messages]);

    function handleResumeClick() {
        setIsAutoScroll(true);
        setShowResumeBtn(false);
        scrollToBottom("auto");
    }

    function handleOpenResponse(id: string) {
        if (onOpenResponse) onOpenResponse(id);
    }

    return (
        <GlowingCard className="h-[500px] lg:h-full flex flex-col relative overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-border/50 bg-primary/5 backdrop-blur flex items-center gap-2">
                <div className="relative">
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                    <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm font-semibold">Live Student Queries</div>
            </div>

            <div
                ref={containerRef}
                className="px-4 py-3 overflow-y-auto h-full space-y-3 live-chat-scrollbar"
                style={{ scrollbarGutter: "stable" }}
            >
                {messages.map((m) => (
                    <div key={m.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Avatar */}
                        <div className="h-9 w-9 rounded-full border border-border bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {m.user.avatar.length <= 2 ? (
                                <span className="text-xs font-medium text-primary">{m.user.avatar}</span>
                            ) : (
                                <img
                                    src={m.user.avatar}
                                    alt={m.user.name}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-sm font-medium text-foreground">
                                        {m.user.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                        {m.text}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleOpenResponse(m.id)}
                                    className={cn(
                                        "ml-2 p-2 rounded-full hover:bg-muted transition-colors shrink-0",
                                        m.isExpanded && "bg-muted"
                                    )}
                                >
                                    <ArrowRight className={cn(
                                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                        m.isExpanded && "rotate-90"
                                    )} />
                                </button>
                            </div>

                            {m.isExpanded && (
                                <div className="mt-2 rounded-md bg-primary/5 p-3 text-sm border border-primary/10 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-2 mb-1 text-primary text-xs font-semibold">
                                        <Bot className="h-3 w-3" />
                                        AI Response:
                                    </div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                        {m.aiResponse}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div style={{ height: 24 }} />
            </div>

            {showResumeBtn && (
                <button
                    onClick={handleResumeClick}
                    className="absolute right-4 bottom-4 flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white transition-all animate-in fade-in zoom-in duration-300"
                    title="Resume auto-scroll"
                >
                    <ArrowDown className="w-6 h-6" />
                </button>
            )}
        </GlowingCard>
    );
}
