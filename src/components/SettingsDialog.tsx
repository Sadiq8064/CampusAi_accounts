import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { User, Moon, Zap, Database, Check, X, Building, Calendar, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variant?: 'admin' | 'user';
}

export function SettingsDialog({ open, onOpenChange, variant = 'admin' }: SettingsDialogProps) {
    const { theme, setTheme } = useTheme();

    // Profile State
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [universityInfo, setUniversityInfo] = useState<any>(null);

    // Edit States
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");

    // Automation State
    const [aiCommentEnabled, setAiCommentEnabled] = useState(() => {
        return localStorage.getItem("aiCommentEnabled") === "true";
    });

    useEffect(() => {
        if (open) {
            fetchProfile();
        }
    }, [open]);

    const fetchProfile = async () => {
        setIsLoading(true);
        const email = localStorage.getItem("accountEmail");
        if (!email) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await authApi.getProfile(email);
            setProfile(data.account);
            setUniversityInfo(data.universityInfo);
            setTempName(data.account.accountName);
        } catch (error) {
            console.error("Failed to fetch profile settings:", error);
            // toast.error("Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveName = async () => {
        if (!profile) return;

        try {
            await authApi.updateProfile(profile.accountEmail, {
                accountName: tempName,
                isActive: profile.isActive
            });
            setProfile({ ...profile, accountName: tempName });
            setIsEditingName(false);
            toast.success("Name updated successfully");

            // Update local storage if needed to reflect immediately elsewhere
            const currentAccount = JSON.parse(localStorage.getItem("account") || "{}");
            currentAccount.accountName = tempName;
            localStorage.setItem("account", JSON.stringify(currentAccount));

        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update name");
        }
    };

    const handleEnableAccount = async () => {
        if (!profile) return;

        try {
            // "Enable" usually implies setting isActive to true
            await authApi.updateProfile(profile.accountEmail, {
                isActive: true
            });
            setProfile({ ...profile, isActive: true });
            toast.success("Account login method enabled");
        } catch (error) {
            console.error("Enable error:", error);
            toast.error("Failed to enable account");
        }
    };

    const handleAiCommentToggle = (checked: boolean) => {
        setAiCommentEnabled(checked);
        localStorage.setItem("aiCommentEnabled", String(checked));
        toast.success(`AI Commenting ${checked ? 'enabled' : 'disabled'}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        if (!name) return "AD";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[700px] p-0 overflow-hidden bg-background flex gap-0 sm:rounded-xl shadow-2xl border border-border">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <DialogDescription className="sr-only">Manage your account and application settings</DialogDescription>

                <Tabs defaultValue="account" orientation="vertical" className="flex h-full w-full">
                    {/* Sidebar */}
                    <div className="w-64 bg-muted/30 border-r border-border/50 flex flex-col gap-2 shrink-0 py-6">
                        <div className="px-6 mb-6">
                            <h2 className="text-xl font-bold tracking-tight">Settings</h2>
                        </div>
                        <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0 px-3 w-full">
                            <TabsTrigger
                                value="account"
                                className="w-full justify-start px-3 py-2 h-9 text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                            >
                                <User className="w-4 h-4 mr-3" /> Account
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className="w-full justify-start px-3 py-2 h-9 text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                            >
                                <Moon className="w-4 h-4 mr-3" /> Appearance
                            </TabsTrigger>
                            <TabsTrigger
                                value="automation"
                                className="w-full justify-start px-3 py-2 h-9 text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-colors"
                            >
                                <Zap className="w-4 h-4 mr-3" /> Automation
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto bg-background/50">
                        {/* Account Tab */}
                        <TabsContent value="account" className="m-0 p-0 h-full focus-visible:ring-0 outline-none">
                            <div className="p-8 max-w-3xl mx-auto space-y-8">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
                                        <p className="text-muted-foreground text-base">Manage your account information.</p>
                                    </div>
                                    <Avatar className="h-14 w-14 border border-border shadow-sm">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                                            {profile ? getInitials(profile.accountName) : 'AD'}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : profile ? (
                                    <div className="space-y-1">
                                        {/* Full Name Row */}
                                        <div className="flex items-center justify-between py-6 border-b border-border/40">
                                            <div className="space-y-1 flex-1 mr-4">
                                                <Label className="text-sm font-medium text-muted-foreground">Full name</Label>
                                                <p className="text-base font-medium">{profile.accountName}</p>
                                            </div>
                                        </div>

                                        {/* Email Row */}
                                        <div className="flex items-center justify-between py-6 border-b border-border/40">
                                            <div className="space-y-1 flex-1 mr-4">
                                                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                                <p className="text-base font-medium">{profile.accountEmail}</p>
                                            </div>
                                        </div>

                                        {/* Account Created Row */}
                                        <div className="flex items-center justify-between py-6 border-b border-border/40">
                                            <div className="space-y-1">
                                                <Label className="text-sm font-medium text-muted-foreground">Account created</Label>
                                                <p className="text-base font-medium">{formatDate(profile.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-muted-foreground">
                                        Failed to load profile. Please try logging in again.
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Appearance Tab */}
                        <TabsContent value="appearance" className="m-0 p-0 h-full focus-visible:ring-0 outline-none">
                            <div className="p-8 max-w-3xl mx-auto space-y-8">
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
                                    <p className="text-muted-foreground text-base">Customize the look and feel.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 rounded-xl border border-border/50 bg-card/40">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium">Dark Mode</Label>
                                            <p className="text-sm text-muted-foreground">Adjust the theme for better visibility.</p>
                                        </div>
                                        <Switch
                                            checked={theme === 'dark'}
                                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Automation Tab */}
                        <TabsContent value="automation" className="m-0 p-0 h-full focus-visible:ring-0 outline-none">
                            <div className="p-8 max-w-3xl mx-auto space-y-8">
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold tracking-tight">Automation</h1>
                                    <p className="text-muted-foreground text-base">Manage your automation settings.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* AI Comment Toggle */}
                                    <div className="flex items-center justify-between p-6 rounded-xl border border-border/50 bg-card/40">
                                        <div className="space-y-1">
                                            <Label htmlFor="ai-comment-toggle" className="text-base font-medium">AI Comment</Label>
                                            <p className="text-sm text-muted-foreground">Automate commenting on social media posts.</p>
                                        </div>
                                        <Switch
                                            id="ai-comment-toggle"
                                            checked={aiCommentEnabled}
                                            onCheckedChange={handleAiCommentToggle}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
