import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import CommunityFeed from "@/components/CommunityFeed";
import { BackgroundGlow } from "@/components/ui/background-glow";
import { UnifiedHeader } from "@/components/UnifiedHeader";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { GalleryVerticalEnd } from "lucide-react";

const CommunityContent = () => {
    const { toggleSidebar, open } = useSidebar();
    const [userDepartment, setUserDepartment] = useState<string>("Department");
    const [feedView, setFeedView] = useState<'campus' | 'my'>('campus');
    const [currentUser, setCurrentUser] = useState({
        name: "Admission Agent",
        handle: "@AdmissionAgent",
        avatar: "/placeholder-avatar.jpg",
        initials: "AA",
        email: "admission@university.edu" // Default/Placeholder
    });

    const [userPassword, setUserPassword] = useState("mypass123");

    useEffect(() => {
        const accountStr = localStorage.getItem("account");
        const storedPassword = localStorage.getItem("accountPassword");

        if (storedPassword) {
            setUserPassword(storedPassword);
        }

        if (accountStr) {
            try {
                const account = JSON.parse(accountStr);
                if (account.accountName) {
                    setUserDepartment(account.accountName);

                    // Derive user details
                    const name = account.accountName;
                    const handle = "@" + name.replace(/\s+/g, "");

                    // Initials
                    const words = name.trim().split(/\s+/);
                    let initials = "";
                    if (words.length > 0) {
                        initials = words[0].charAt(0).toUpperCase();
                        if (words.length > 1) {
                            initials += words[1].charAt(0).toUpperCase();
                        }
                    } else {
                        initials = name.substring(0, 2).toUpperCase();
                    }

                    setCurrentUser({
                        name,
                        handle,
                        avatar: "/placeholder-avatar.jpg",
                        initials,
                        email: account.accountEmail // Add email
                    });
                }
            } catch (e) {
                console.error("Failed to parse account", e);
            }
        }
    }, []);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <AppSidebar />

            <main className="flex-1 h-full bg-background overflow-y-auto relative">
                <UnifiedHeader
                    title="Community"
                    onSidebarToggle={toggleSidebar}
                    isSidebarOpen={open}
                    extraActions={
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFeedView(v => v === 'campus' ? 'my' : 'campus')}
                            className={feedView === 'my' ? "bg-primary/10 text-primary" : "text-muted-foreground"}
                            title={feedView === 'campus' ? "View My Posts" : "View Campus Feed"}
                        >
                            <GalleryVerticalEnd className="h-5 w-5" />
                        </Button>
                    }
                />

                <div className="relative flex justify-center min-h-[calc(100vh-4rem)]">
                    <BackgroundGlow />
                    <div className="relative z-10 w-full flex justify-center">
                        <CommunityFeed feedViewMode={feedView} currentUser={currentUser} currentPassword={userPassword} />
                    </div>
                </div>
            </main>
        </div>
    );
};

const Community = () => {
    return (
        <SidebarProvider>
            <CommunityContent />
        </SidebarProvider>
    );
};

export default Community;
