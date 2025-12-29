import { LayoutDashboard, Ticket, AlertTriangle, MessageSquare, Radio, LogOut, Users, Bot, GraduationCap, Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// import govtLogo from "@/assets/emblem-new.jpg";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Knowledge Base", url: "/notifications", icon: Radio },
    { title: "Tickets", url: "/tickets", icon: Ticket },
    { title: "Community", url: "/community", icon: Users },
    { title: "Feedback", url: "/feedback", icon: MessageSquare },
];

export function AppSidebar() {
    const { state, isMobile, setOpenMobile } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const [userLocation, setUserLocation] = useState<{ state: string; city: string } | null>(null);
    const [accountName, setAccountName] = useState<string>("Account");

    const isActive = (path: string) => currentPath === path;
    const isCollapsed = state === "collapsed";

    useEffect(() => {
        const userState = localStorage.getItem("userState");
        const userCity = localStorage.getItem("userCity");
        if (userState && userCity) {
            setUserLocation({ state: userState, city: userCity });
        }

        const accountStr = localStorage.getItem("account");
        if (accountStr) {
            try {
                const account = JSON.parse(accountStr);
                if (account.accountName) {
                    setAccountName(account.accountName);
                }
            } catch (e) {
                console.error("Failed to parse account", e);
            }
        }
    }, []);

    const handleNavClick = () => {
        // Close mobile sidebar on navigation
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const handleLogout = () => {
        // Add logout logic here
        navigate("/");
    };

    return (
        <Sidebar collapsible="icon" className="border-r-0 glass">
            {/* Logo Header */}
            <div className={`${isCollapsed ? "py-3" : "p-4"} mb-2 transition-all border-b border-border/30`}>
                <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                    <div className={`${isCollapsed ? "h-10 w-10 flex items-center justify-center" : "h-10 w-10"}`}>
                        <NavLink to="/dashboard" className="block w-full h-full flex items-center justify-center">
                            <div className="h-full w-full rounded-full border border-border flex items-center justify-center bg-background hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                        </NavLink>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col justify-center gap-0.5">
                            <span className="font-sans font-bold text-base tracking-tight">{accountName}</span>
                            <span className="text-xs text-muted-foreground">⚡ Powered by CampusAI</span>
                        </div>
                    )}
                </div>
            </div>

            <SidebarContent className={`${isCollapsed ? "px-2" : "px-3"} transition-all`}>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild size="lg" className={`rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 ${isCollapsed ? "!w-full !h-14 !p-0 justify-center" : "!h-12"}`}>
                                        <NavLink
                                            to={item.url}
                                            end
                                            onClick={handleNavClick}
                                            className={`flex items-center gap-3 w-full h-full ${isCollapsed ? "justify-center" : "px-3"}`}
                                            activeClassName="glass text-primary font-semibold"
                                        >
                                            <item.icon className={`shrink-0 ${isCollapsed ? "h-6 w-6" : "h-5 w-5"}`} />
                                            {!isCollapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Logout at Bottom */}
            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} className="h-12 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <LogOut className="h-5 w-5" />
                            {!isCollapsed && <span>Logout</span>}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
