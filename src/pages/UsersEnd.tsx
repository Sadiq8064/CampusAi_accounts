import { useState, useRef, useEffect } from "react";
import {
    MessageSquare,
    Share2,
    Ticket,
    Grid,
    Clock,
    Send,
    ChevronDown,
    User,
    Bot,
    ArrowUp,
    Search,
    Copy,
    Paperclip,
    Settings,
    LogOut,
    GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NavLink, useNavigate } from "react-router-dom";
import CommunityFeed from "@/components/CommunityFeed";
import UserTickets from "@/components/UserTickets";
import UserServices from "@/components/UserServices";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
// import govtLogo from "@/assets/emblem-new.jpg";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
}

const UsersEnd = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState("Auto");
    const [activeTab, setActiveTab] = useState("Chat");
    const [userLocation, setUserLocation] = useState<{ state: string; city: string } | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const currentChatIdRef = useRef<string | null>(null);
    const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleSidebarToggle = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        localStorage.removeItem("userState");
        localStorage.removeItem("userCity");
        localStorage.removeItem("chatHistory");
        navigate("/");
    };

    useEffect(() => {
        const savedHistory = localStorage.getItem("chatHistory");
        if (savedHistory) {
            try {
                setChatHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
    }, []);

    const saveChatToHistory = (chatId: string, msgs: Message[]) => {
        if (msgs.length === 0) return;

        setChatHistory(prev => {
            const existingChatIndex = prev.findIndex(c => c.id === chatId);
            let updatedHistory;

            if (existingChatIndex >= 0) {
                updatedHistory = [...prev];
                updatedHistory[existingChatIndex] = {
                    ...updatedHistory[existingChatIndex],
                    messages: msgs,
                    timestamp: Date.now() // Update timestamp on new message
                };
            } else {
                // Extract first sentence for title
                const firstMessage = msgs[0].content;
                const firstSentence = firstMessage.match(/[^.!?]+[.!?]?/)?.[0] || firstMessage;
                const title = firstSentence.trim().slice(0, 50) + (firstSentence.length > 50 ? "..." : "");

                const newChat: ChatSession = {
                    id: chatId,
                    title: title,
                    messages: msgs,
                    timestamp: Date.now()
                };
                updatedHistory = [newChat, ...prev];
            }

            // Sort by timestamp desc
            updatedHistory.sort((a, b) => b.timestamp - a.timestamp);

            localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
            return updatedHistory;
        });
    };

    const loadChat = (chatId: string) => {
        const chat = chatHistory.find(c => c.id === chatId);
        if (chat) {
            setCurrentChatId(chat.id);
            currentChatIdRef.current = chat.id;
            setMessages(chat.messages);
            setActiveTab("Chat");
        }
    };

    const startNewChat = () => {
        setCurrentChatId(null);
        currentChatIdRef.current = null;
        setMessages([]);
        setActiveTab("Chat");
    };

    const sidebarItems = [
        { icon: MessageSquare, label: "Chat" },
        { icon: Share2, label: "Social Media" },
        { icon: Ticket, label: "Tickets" },
        { icon: Grid, label: "Departments" },
        { icon: Clock, label: "History" },
    ];

    const models = ["Auto", "Fast", "Expert", "Grok 4.1", "Heavy"];

    useEffect(() => {
        const userState = localStorage.getItem("userState");
        const userCity = localStorage.getItem("userCity");
        if (userState && userCity) {
            setUserLocation({ state: userState, city: userCity });
        }
    }, []);

    const handleStopGeneration = () => {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        setIsTyping(false);
    };

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInputValue("");

        // Determine Chat ID
        let chatId = currentChatId;
        if (!chatId) {
            chatId = Date.now().toString();
            setCurrentChatId(chatId);
            currentChatIdRef.current = chatId;
        }

        // Save immediately with user message
        saveChatToHistory(chatId, updatedMessages);

        setIsTyping(true);

        // Simulate AI response with typing effect
        setTimeout(() => {
            // Only update typing state if we are still on the same chat
            if (currentChatIdRef.current !== chatId) {
                return;
            }

            const aiResponseId = (Date.now() + 1).toString();
            const fullContent = "Here is a detailed response to demonstrate the layout orientation and scrolling behavior.\n\nFirst, let's look at the structure. The chat interface is designed to be minimal and unobtrusive, similar to modern AI assistants. The messages are stacked from the bottom, ensuring that the most recent interaction is always at eye level.\n\nSecondly, regarding the content presentation: long answers like this one should flow naturally without feeling cramped. The text is left-aligned for the AI to distinguish it from user queries, which are typically right-aligned or distinctively styled.\n\nFinally, this long text helps verify that the auto-scrolling mechanism works as expected. When a new message arrives, the view should smoothly scroll to reveal the latest content, while still allowing you to scroll back up to read the beginning of the response. This ensures a seamless reading experience even for extensive explanations.";

            // Add empty AI message first
            if (currentChatIdRef.current === chatId) {
                setMessages((prev) => {
                    const newMsgs = [
                        ...prev,
                        {
                            id: aiResponseId,
                            role: "ai" as const,
                            content: "",
                        },
                    ];
                    return newMsgs;
                });
            }

            let currentIndex = 0;
            typingIntervalRef.current = setInterval(() => {
                if (currentIndex < fullContent.length) {
                    const currentText = fullContent.slice(0, currentIndex + 1);

                    // Update UI only if active
                    if (currentChatIdRef.current === chatId) {
                        setMessages((prev) => {
                            const updated = prev.map((msg) =>
                                msg.id === aiResponseId
                                    ? { ...msg, content: currentText }
                                    : msg
                            );
                            return updated;
                        });
                    }

                    // Update history in background
                    // We need to reconstruct the message list for history update
                    const historyMessages = [...updatedMessages, {
                        id: aiResponseId,
                        role: "ai" as const,
                        content: currentText
                    }];
                    saveChatToHistory(chatId!, historyMessages);

                    currentIndex++;
                } else {
                    if (typingIntervalRef.current) {
                        clearInterval(typingIntervalRef.current);
                        typingIntervalRef.current = null;
                    }
                    // Final state update
                    if (currentChatIdRef.current === chatId) {
                        setIsTyping(false); // Ensure typing is off
                    }
                }
            }, 10); // Adjust speed here (lower is faster)
        }, 1000);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            {/* Custom Sidebar */}
            {/* Custom Sidebar */}
            <div className={cn("flex-shrink-0 border-r border-border/40 flex flex-col bg-card/30 backdrop-blur-xl transition-all duration-300 ease-in-out", isSidebarOpen ? "w-[280px]" : "w-[80px]")}>
                <div className="p-4 flex flex-col h-full">
                    {/* Logo Header */}
                    <div className={cn("flex items-center mb-6 transition-all duration-300", isSidebarOpen ? "px-2 justify-between" : "justify-center px-0")}>
                        <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
                            <div className="h-10 w-10 flex-shrink-0">
                                <NavLink to="/dashboard" className="block w-full h-full">
                                    <div className="h-full w-full rounded-full border border-border flex items-center justify-center bg-background hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                    </div>
                                </NavLink>
                            </div>
                            {isSidebarOpen && (
                                <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="font-poppins font-extrabold text-[12px] uppercase tracking-wide whitespace-nowrap">Student Portal</span>
                                    {userLocation && (
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                            {userLocation.state} | {userLocation.city}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* New Chat Button */}
                    <div className={cn("mb-2 transition-all duration-300", isSidebarOpen ? "px-2" : "px-0 flex justify-center")}>
                        <div
                            onClick={startNewChat}
                            className={cn(
                                "flex items-center gap-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-all cursor-pointer border border-primary/20",
                                isSidebarOpen ? "px-4 py-2.5" : "h-10 w-10 justify-center p-0"
                            )}
                        >
                            <MessageSquare className="h-4 w-4" />
                            {isSidebarOpen && <span className="text-sm font-medium animate-in fade-in zoom-in duration-200">New Chat</span>}
                        </div>
                    </div>

                    {/* Search Chats Trigger */}
                    <div className={cn("mb-6 transition-all duration-300", isSidebarOpen ? "px-2" : "px-0 flex justify-center")}>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={cn(
                                "flex items-center gap-2 w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all cursor-pointer rounded-lg border border-transparent hover:border-border/50",
                                isSidebarOpen ? "px-3 py-2" : "h-10 w-10 justify-center p-0"
                            )}
                        >
                            <Search className="h-4 w-4" />
                            {isSidebarOpen && <span className="text-sm font-medium truncate">Search chats...</span>}
                        </button>
                    </div>

                    {/* Main Navigation */}
                    <nav className="space-y-2 mb-8">
                        {[
                            { icon: MessageSquare, label: "Chat" },
                            { icon: Share2, label: "Social Media" },
                            { icon: Ticket, label: "Tickets" },
                            { icon: Grid, label: "Departments" },
                        ].map((item) => (
                            <TooltipProvider key={item.label} delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => {
                                                if (item.label === "Chat") {
                                                    startNewChat();
                                                } else {
                                                    setActiveTab(item.label);
                                                }
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 w-full rounded-lg transition-colors text-[15px] font-medium h-10",
                                                isSidebarOpen ? "px-4 justify-start" : "justify-center px-0",
                                                activeTab === item.label
                                                    ? "bg-secondary/80 text-foreground font-semibold"
                                                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                                            {isSidebarOpen && <span className="animate-in fade-in slide-in-from-left-2 duration-200">{item.label}</span>}
                                        </button>
                                    </TooltipTrigger>
                                    {!isSidebarOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </nav>

                    {/* History Section - Only visible when open */}
                    <div className={cn("flex-1 overflow-y-auto pr-2", !isSidebarOpen && "hidden")}>
                        <div className="px-4 mb-2 flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-semibold">History</span>
                        </div>

                        <div className="space-y-4 pl-4 mt-2">
                            {chatHistory.length === 0 ? (
                                <div className="text-xs text-muted-foreground px-2">No history yet</div>
                            ) : (
                                <div>
                                    <h3 className="text-xs font-medium text-muted-foreground/70 mb-2 px-2">Recent</h3>
                                    {chatHistory.map((chat) => (
                                        <button
                                            key={chat.id}
                                            onClick={() => loadChat(chat.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate mb-1",
                                                currentChatId === chat.id
                                                    ? "bg-secondary text-foreground font-medium"
                                                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                                            )}
                                        >
                                            {chat.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="mt-auto pt-4 border-t border-border/20">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className={cn("relative h-12 w-full hover:bg-secondary/50 rounded-xl group overflow-hidden", isSidebarOpen ? "px-2 justify-start" : "justify-center px-0")}>
                                    <div className={cn("flex items-center gap-3 w-full", !isSidebarOpen && "justify-center")}>
                                        <Avatar className="h-9 w-9 border border-border/50 transition-transform group-hover:scale-105 flex-shrink-0">
                                            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                                            <AvatarFallback className="bg-primary/10 text-primary">UN</AvatarFallback>
                                        </Avatar>
                                        {isSidebarOpen && (
                                            <div className="flex flex-col items-start text-left transition-opacity duration-200 animate-in fade-in slide-in-from-left-2">
                                                <span className="text-sm font-medium leading-none group-hover:text-primary transition-colors">User Name</span>
                                                <span className="text-xs text-muted-foreground truncate w-32 group-hover:text-muted-foreground/80">user@example.com</span>
                                            </div>
                                        )}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mb-2 ml-2" align="start" side="top" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">User Name</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            user@example.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Logout Button */}
                        {isSidebarOpen && (
                            <Button
                                variant="ghost"
                                className="w-full justify-start px-2 hover:bg-red-500/10 hover:text-red-600 text-muted-foreground transition-colors mt-2"
                                onClick={handleLogout}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="h-9 w-9 flex items-center justify-center">
                                        <LogOut className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium">Log out</span>
                                </div>
                            </Button>
                        )}
                        {!isSidebarOpen && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full h-10 mt-2 hover:bg-red-500/10 hover:text-red-600 text-muted-foreground transition-colors"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div >

            {/* Main Content Area */}
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                {/* Theme Toggle - Absolute Positioned - Only for Chat */}
                {activeTab === "Chat" && (
                    <div className="absolute top-4 right-4 z-50">
                        <ThemeToggle />
                    </div>
                )}

                {activeTab === "Chat" ? (
                    <AnimatedAIChat
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        onSendMessage={handleSendMessage}
                        isTyping={isTyping}
                        messages={messages}
                        onStopGeneration={handleStopGeneration}
                    />
                ) : activeTab === "Social Media" ? (
                    <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 z-50">
                            <UnifiedHeader title="Community" subtitle="Student Portal" onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />
                        </div>
                        <div className="h-full overflow-y-auto w-full pt-16">
                            <div className="relative flex-1 flex justify-center min-h-full">
                                <BackgroundGlow />
                                <div className="relative z-10 w-full min-h-full flex justify-center">
                                    <CommunityFeed />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === "Tickets" ? (
                    <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 z-50">
                            <UnifiedHeader title="My Tickets" subtitle="Student Portal" onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />
                        </div>
                        <div className="h-full overflow-y-auto w-full pt-16">
                            <div className="relative flex-1 flex justify-center min-h-full">
                                <BackgroundGlow />
                                <div className="relative z-10 w-full h-full flex justify-center">
                                    <UserTickets />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === "Departments" ? (
                    <div className="flex-1 flex flex-col relative h-full overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 z-50">
                            <UnifiedHeader title="Departments" subtitle="Student Portal" onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />
                        </div>
                        <div className="h-full overflow-y-auto w-full pt-16">
                            <div className="relative flex-1 flex justify-center min-h-full">
                                <BackgroundGlow />
                                <div className="relative z-10 w-full h-full flex justify-center">
                                    <UserServices />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Coming Soon
                    </div>
                )}
            </div>

            <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <CommandInput placeholder="Search previous chats..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="History">
                        {chatHistory.map((chat) => (
                            <CommandItem
                                key={chat.id}
                                onSelect={() => {
                                    loadChat(chat.id);
                                    setIsSearchOpen(false);
                                }}
                            >
                                <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{chat.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>

            <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} variant="user" />
        </div>
    );
};

export default UsersEnd;
